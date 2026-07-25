package com.voltify.core.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltify.core.dto.ApplianceStatus;
import com.voltify.core.dto.HomeStatusResponse;
import com.voltify.core.dto.HomeUpdateRequest;
import com.voltify.core.entity.Appliance;
import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.ConsumptionSnapshot;
import com.voltify.core.entity.Home;
import com.voltify.core.entity.User;
import com.voltify.core.exception.ForbiddenException;
import com.voltify.core.exception.ResourceNotFoundException;
import com.voltify.core.ignite.ApplianceReading;
import com.voltify.core.ignite.HomeLiveState;
import com.voltify.core.repository.ApplianceRepository;
import com.voltify.core.repository.BillingLedgerRepository;
import com.voltify.core.repository.ConsumptionSnapshotRepository;
import com.voltify.core.repository.HomeRepository;

@Service
public class HomeService {

    private final HomeRepository homeRepository;
    private final ApplianceRepository applianceRepository;
    private final BillingLedgerRepository billingLedgerRepository;
    private final ConsumptionSnapshotRepository consumptionSnapshotRepository;
    private final KafkaProducerService kafkaProducerService;
    private final IgniteService igniteService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HomeService(HomeRepository homeRepository,
                    ApplianceRepository applianceRepository,
                    BillingLedgerRepository billingLedgerRepository,
                    ConsumptionSnapshotRepository consumptionSnapshotRepository,
                    KafkaProducerService kafkaProducerService,
                    IgniteService igniteService) {
        this.homeRepository = homeRepository;
        this.applianceRepository = applianceRepository;
        this.billingLedgerRepository = billingLedgerRepository;
        this.consumptionSnapshotRepository = consumptionSnapshotRepository;
        this.kafkaProducerService = kafkaProducerService;
        this.igniteService = igniteService;
    }

    // Şartname: Home Registration - Yeni ev + cihazlar PostgreSQL'e kaydedilir,
    // aynı anda Kafka'ya "yeni ev eklendi" mesajı basılır (Telemetry Sensors için)
    @Transactional
    public Home registerHome(Home home) {
        // Şu an giriş yapmış kullanıcıyı bul ve evin sahibi (owner) yap
        User currentUser = getCurrentUser();
        home.setOwner(currentUser);

        // Zorunlu alanlar için varsayılan değerleri ata (null ise)
        if (home.getContactEmail() == null) {
            home.setContactEmail(currentUser.getEmail() != null ? currentUser.getEmail() : "demo@voltify.com");
        }
        if (home.getPowerQuotaWatt() == null) {
            home.setPowerQuotaWatt(8800.0); // ~40A tek faz ev ana hattı (gerçekçi anlık güç tavanı)
        }
        if (home.getBudgetQuotaTry() == null) {
            home.setBudgetQuotaTry(1500.0);
        }
        if (home.getBaseRate() == null) {
            home.setBaseRate(2.07);
        }
        if (home.getPenaltyRate() == null) {
            home.setPenaltyRate(5.18);
        }
        if (home.getSquareMeters() == null) {
            home.setSquareMeters(120);
        }
        if (home.getRoomLayout() == null) {
            home.setRoomLayout("2+1");
        }

        // Cihazların hangi eve ait olduğunu belirt (çift yönlü ilişki)
        if (home.getAppliances() != null) {
            home.getAppliances().forEach(appliance -> appliance.setHome(home));
        }

        // Ev PostgreSQL'e kaydediliyor
        Home savedHome = homeRepository.save(home);

        // Her yeni ev için otomatik olarak boş bir BillingLedger (fatura defteri) oluşturuluyor
        BillingLedger ledger = new BillingLedger();
        ledger.setHome(savedHome);
        BillingLedger savedLedger = billingLedgerRepository.save(ledger);
        savedHome.setBillingLedger(savedLedger);

        // Kafka'ya asset registration event'i gönderiliyor
        // Telemetry Sensors bu mesajı yakalayıp yeni evi simülasyon listesine ekleyecek
        try {
            String homeJson = objectMapper.writeValueAsString(savedHome);
            kafkaProducerService.sendMessage("asset-registration", homeJson);
        } catch (Exception e) {
            System.err.println("Kafka'ya mesaj gönderilirken hata oluştu: " + e.getMessage());
        }

        return savedHome;
    }

    // Giriş yapmış kullanıcının kendine ait evlerini listeler
    public List<Home> getMyHomes() {
        return homeRepository.findByOwner(getCurrentUser());
    }

    // Şartname: Home Status Delivery - Statik bilgiler PostgreSQL'den,
    // anlık/canlı bilgiler (tüketim, bakiye, ceza durumu) Ignite'tan okunur
    public HomeStatusResponse getHomeStatus(Long homeId) {
        // Önce evi PostgreSQL'de bul ve sahibi olduğumuzu doğrula
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);

        // Statik/kalıcı bilgileri PostgreSQL'den (Home entity'sinden) doldur
        HomeStatusResponse response = new HomeStatusResponse();
        response.setId(home.getId());
        response.setName(home.getName());
        response.setContactEmail(home.getContactEmail());
        response.setPowerQuotaWatt(home.getPowerQuotaWatt());
        response.setBudgetQuotaTry(home.getBudgetQuotaTry());
        response.setBaseRate(home.getBaseRate());
        response.setPenaltyRate(home.getPenaltyRate());
        response.setSquareMeters(home.getSquareMeters());
        response.setRoomLayout(home.getRoomLayout());

        // Cihaz başına canlı durum: statik alanlar PostgreSQL'den, anlık watt & anomali Ignite'tan
        List<ApplianceStatus> applianceStatuses = new ArrayList<>();
        if (home.getAppliances() != null) {
            for (Appliance appliance : home.getAppliances()) {
                ApplianceStatus status = new ApplianceStatus();
                status.setId(appliance.getId());
                status.setName(appliance.getName());
                status.setRoom(appliance.getRoom());
                status.setType(appliance.getType());
                status.setMaxSafeWattage(appliance.getSafePowerLimit() != null ? appliance.getSafePowerLimit() : 0.0);
                status.setCurrentWattage(igniteService.getApplianceWatt(appliance.getId()));
                status.setIsAnomalous(igniteService.isApplianceAnomalous(appliance.getId()));
                status.setPowerOn(appliance.getPowerOn() == null || appliance.getPowerOn());
                double applKwh = igniteService.getApplianceTotalKwh(appliance.getId());
                double rate = home.getBaseRate() != null ? home.getBaseRate() : 2.07;
                status.setTotalKwh(round2(applKwh));
                status.setTotalCost(round2(applKwh * rate));
                applianceStatuses.add(status);
            }
        }
        response.setAppliances(applianceStatuses);

        // Ev geneli anlık/canlı bilgileri Ignite'tan (sub-millisecond okuma) doldur
        HomeLiveState liveState = igniteService.getOrCreateHomeState(homeId);
        response.setAccumulatedWatt(liveState.getAccumulatedWatt());
        response.setTotalKwh(round2(liveState.getAccumulatedWatt() / IgniteService.WATT_SUM_TO_KWH));
        response.setCurrentBalance(liveState.getCurrentBalance());
        response.setIsPenaltyActive(liveState.getIsPenaltyActive());
        response.setLastUpdatedMillis(liveState.getLastUpdatedMillis());

        return response;
    }

    // 2 ondalığa yuvarla
    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // Şartname: Historical Trend Delivery - Geçmiş tüketim grafikleri için
    // PostgreSQL'deki günlük anlık görüntüleri (snapshot) döndürür (Pagination & Date Filter destekli)
    public List<ConsumptionSnapshot> getHomeHistory(Long homeId) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);
        return consumptionSnapshotRepository.findByHomeIdOrderBySnapshotDateAsc(homeId);
    }

    public Page<ConsumptionSnapshot> getHomeHistoryPage(Long homeId, int page, int size, LocalDate from, LocalDate to) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);
        Pageable pageable = PageRequest.of(page, size);
        return consumptionSnapshotRepository.findByHomeIdAndDateRange(homeId, from, to, pageable);
    }

    // Cihaz-bazlı GERÇEK tüketim geçmişi (Ignite dönen 24 saatlik pencere).
    // Grafiğin 1s/6s/24s aralıklarını modelleme yerine gerçek veriyle besler.
    public List<ApplianceReading> getApplianceReadings(Long homeId, Long applianceId, int minutes) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);
        boolean belongs = home.getAppliances() != null
                && home.getAppliances().stream().anyMatch(a -> a.getId().equals(applianceId));
        if (!belongs) {
            throw new ResourceNotFoundException("Bu eve ait cihaz bulunamadı: " + applianceId);
        }
        int windowMinutes = Math.max(1, Math.min(minutes, 1440)); // 1 dk – 24 saat arası
        long since = System.currentTimeMillis() - (long) windowMinutes * 60_000L;
        return igniteService.getApplianceHistory(applianceId, since);
    }

    // Yardımcı: SecurityContextHolder'dan şu an giriş yapmış kullanıcıyı al
    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // Ev bilgilerini kısmi olarak günceller (sadece null olmayan alanlar).
    @Transactional
    public Home updateHome(Long homeId, HomeUpdateRequest request) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);

        if (request.getName() != null) home.setName(request.getName());
        if (request.getContactEmail() != null) home.setContactEmail(request.getContactEmail());
        if (request.getPowerQuotaWatt() != null) home.setPowerQuotaWatt(request.getPowerQuotaWatt());
        if (request.getBudgetQuotaTry() != null) home.setBudgetQuotaTry(request.getBudgetQuotaTry());
        if (request.getBaseRate() != null) home.setBaseRate(request.getBaseRate());
        if (request.getPenaltyRate() != null) home.setPenaltyRate(request.getPenaltyRate());
        if (request.getSquareMeters() != null) home.setSquareMeters(request.getSquareMeters());
        if (request.getRoomLayout() != null) home.setRoomLayout(request.getRoomLayout());

        return homeRepository.save(home);
    }

    // Evi siler (cascade sayesinde cihazlar ve billing ledger da silinir)
    @Transactional
    public void deleteHome(Long homeId) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);
        homeRepository.delete(home);
    }

    // Mevcut bir eve yeni cihaz ekler
    @Transactional
    public Home addAppliance(Long homeId, Appliance appliance) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);

        appliance.setHome(home);
        home.getAppliances().add(appliance);
        return homeRepository.save(home);
    }

    // Bir eve ait cihazı siler
    @Transactional
    public void deleteAppliance(Long homeId, Long applianceId) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);

        boolean removed = home.getAppliances().removeIf(a -> a.getId().equals(applianceId));
        if (!removed) {
            throw new ResourceNotFoundException("Bu eve ait cihaz bulunamadı: " + applianceId);
        }
        homeRepository.save(home);
    }

    // Bir eve ait cihazı günceller
    @Transactional
    public Appliance updateAppliance(Long homeId, Long applianceId, Appliance updated) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);

        Appliance appliance = applianceRepository.findById(applianceId)
            .orElseThrow(() -> new ResourceNotFoundException("Cihaz bulunamadı: " + applianceId));

        if (updated.getName() != null) appliance.setName(updated.getName());
        if (updated.getSafePowerLimit() != null) appliance.setSafePowerLimit(updated.getSafePowerLimit());
        if (updated.getRoom() != null) appliance.setRoom(updated.getRoom());
        if (updated.getType() != null) appliance.setType(updated.getType());

        return applianceRepository.save(appliance);
    }

    // Cihazı aç/kapat. Kapalıysa simülatör 0W üretir; anında 0 göstermek için
    // Ignite'taki canlı watt da sıfırlanır.
    @Transactional
    public Appliance setAppliancePower(Long homeId, Long applianceId, boolean on) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new ResourceNotFoundException("Ev bulunamadı: " + homeId));
        assertOwnership(home);

        Appliance appliance = applianceRepository.findById(applianceId)
            .orElseThrow(() -> new ResourceNotFoundException("Cihaz bulunamadı: " + applianceId));
        if (appliance.getHome() == null || !appliance.getHome().getId().equals(homeId)) {
            throw new ResourceNotFoundException("Bu eve ait cihaz bulunamadı: " + applianceId);
        }

        appliance.setPowerOn(on);
        Appliance saved = applianceRepository.save(appliance);
        if (!on) {
            igniteService.putApplianceWatt(applianceId, 0.0);
        }
        return saved;
    }

    // Yardımcı: Bu evin, isteği yapan kullanıcıya ait olup olmadığını kontrol eder
    // Değilse ForbiddenException fırlatır (GlobalExceptionHandler bunu 403'e çevirir)
    private void assertOwnership(Home home) {
        User currentUser = getCurrentUser();
        if (!home.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Bu eve erişim yetkiniz yok");
        }
    }
}