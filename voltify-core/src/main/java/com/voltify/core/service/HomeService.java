package com.voltify.core.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voltify.core.dto.HomeUpdateRequest;
import com.voltify.core.entity.Appliance;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltify.core.dto.HomeStatusResponse;
import com.voltify.core.dto.HomeUpdateRequest;
import com.voltify.core.entity.Appliance;
import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.ConsumptionSnapshot;
import com.voltify.core.entity.Home;
import com.voltify.core.entity.User;
import com.voltify.core.exception.ForbiddenException;
import com.voltify.core.ignite.HomeLiveState;
import com.voltify.core.repository.BillingLedgerRepository;
import com.voltify.core.repository.ConsumptionSnapshotRepository;
import com.voltify.core.repository.HomeRepository;

@Service
public class HomeService {

    private final HomeRepository homeRepository;
    private final BillingLedgerRepository billingLedgerRepository;
    private final ConsumptionSnapshotRepository consumptionSnapshotRepository;
    private final KafkaProducerService kafkaProducerService;
    private final IgniteService igniteService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HomeService(HomeRepository homeRepository,
                    BillingLedgerRepository billingLedgerRepository,
                    ConsumptionSnapshotRepository consumptionSnapshotRepository,
                    KafkaProducerService kafkaProducerService,
                    IgniteService igniteService) {
        this.homeRepository = homeRepository;
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
            kafkaProducerService.sendMessage("home-registration-topic", homeJson);
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
            .orElseThrow(() -> new RuntimeException("Home not found: " + homeId));
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
        response.setAppliances(home.getAppliances());

        // Anlık/canlı bilgileri Ignite'tan (sub-millisecond okuma) doldur
        HomeLiveState liveState = igniteService.getOrCreateHomeState(homeId);
        response.setAccumulatedWatt(liveState.getAccumulatedWatt());
        response.setCurrentBalance(liveState.getCurrentBalance());
        response.setIsPenaltyActive(liveState.getIsPenaltyActive());
        response.setLastUpdatedMillis(liveState.getLastUpdatedMillis());

        return response;
    }

    // Şartname: Historical Trend Delivery - Geçmiş tüketim grafikleri için
    // PostgreSQL'deki günlük anlık görüntüleri (snapshot) döndürür
    public List<ConsumptionSnapshot> getHomeHistory(Long homeId) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new RuntimeException("Home not found: " + homeId));
        assertOwnership(home);
        return consumptionSnapshotRepository.findByHomeIdOrderBySnapshotDateAsc(homeId);
    }

    // Yardımcı: SecurityContextHolder'dan şu an giriş yapmış kullanıcıyı al
    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // Ev bilgilerini kısmi olarak günceller (sadece null olmayan alanlar).
    @Transactional
    public Home updateHome(Long homeId, HomeUpdateRequest request) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new RuntimeException("Home not found: " + homeId));
        assertOwnership(home);

        if (request.getName() != null) home.setName(request.getName());
        if (request.getContactEmail() != null) home.setContactEmail(request.getContactEmail());
        if (request.getPowerQuotaWatt() != null) home.setPowerQuotaWatt(request.getPowerQuotaWatt());
        if (request.getBudgetQuotaTry() != null) home.setBudgetQuotaTry(request.getBudgetQuotaTry());
        if (request.getBaseRate() != null) home.setBaseRate(request.getBaseRate());
        if (request.getPenaltyRate() != null) home.setPenaltyRate(request.getPenaltyRate());

        return homeRepository.save(home);
    }

    // Evi siler (cascade sayesinde cihazlar ve billing ledger da silinir)
    @Transactional
    public void deleteHome(Long homeId) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new RuntimeException("Home not found: " + homeId));
        assertOwnership(home);
        homeRepository.delete(home);
    }

    // Mevcut bir eve yeni cihaz ekler
    @Transactional
    public Home addAppliance(Long homeId, Appliance appliance) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new RuntimeException("Home not found: " + homeId));
        assertOwnership(home);

        appliance.setHome(home);
        home.getAppliances().add(appliance);
        return homeRepository.save(home);
    }

    // Bir eve ait cihazı siler
    @Transactional
    public void deleteAppliance(Long homeId, Long applianceId) {
        Home home = homeRepository.findById(homeId)
            .orElseThrow(() -> new RuntimeException("Home not found: " + homeId));
        assertOwnership(home);

        boolean removed = home.getAppliances().removeIf(a -> a.getId().equals(applianceId));
        if (!removed) {
            throw new RuntimeException("Appliance not found in this home: " + applianceId);
        }
        homeRepository.save(home);
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