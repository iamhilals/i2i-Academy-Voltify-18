package com.voltify.core.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.EventLog;
import com.voltify.core.entity.Home;
import com.voltify.core.ignite.HomeLiveState;
import com.voltify.core.repository.BillingLedgerRepository;
import com.voltify.core.repository.EventLogRepository;
import com.voltify.core.repository.HomeRepository;

// Kota değerlendirme, penalty tariff geçişi, event log
@Service
public class TariffEngineService {

    private static final double BREACH_80_THRESHOLD = 0.80;
    private static final double BREACH_100_THRESHOLD = 1.00;

    // 1 Watt-saniye kaç kWh eder? 1000 (kW) * 3600 (saat) = 3.600.000
    // Telemetry her N saniyede geliyor ama biz Watt-cycle'ı direkt akümüle ediyoruz
    // Basitlik için Watt'ı direkt kWh gibi düşünelim (üretimde farklı yaklaşım olurdu)
    // Cost = accumulatedWatt / 1000 * rate  (basit yaklaşım)
    private static final double WATT_TO_KWH_DIVISOR = 1000.0;

    private final HomeRepository homeRepository;
    private final BillingLedgerRepository billingLedgerRepository;
    private final EventLogRepository eventLogRepository;
    private final IgniteService igniteService;
    private final AlertNotificationService alertNotificationService;

    public TariffEngineService(HomeRepository homeRepository,
                                BillingLedgerRepository billingLedgerRepository,
                                EventLogRepository eventLogRepository,
                                IgniteService igniteService,
                                AlertNotificationService alertNotificationService) {
        this.homeRepository = homeRepository;
        this.billingLedgerRepository = billingLedgerRepository;
        this.eventLogRepository = eventLogRepository;
        this.igniteService = igniteService;
        this.alertNotificationService = alertNotificationService;
    }

    // Bir telemetry event'i işle: accumulated watt ve balance güncelle,
    // kota kontrolü yap, gerekirse penalty tarifine geç ve event log oluştur
    @Transactional
    public void processTelemetry(Long homeId, Double wattReading) {
        Optional<Home> homeOpt = homeRepository.findById(homeId);
        if (homeOpt.isEmpty()) {
            System.err.println("Bilinmeyen home_id: " + homeId);
            return;
        }
        Home home = homeOpt.get();

        // 1) Ignite'tan canlı state al (yoksa oluştur)
        HomeLiveState state = igniteService.getOrCreateHomeState(homeId);

        // 2) Geçerli rate belirle
        double rate = state.getIsPenaltyActive() ? home.getPenaltyRate() : home.getBaseRate();
        double addedCost = (wattReading / WATT_TO_KWH_DIVISOR) * rate;

        // 3) Ignite state güncelle
        double newWatt = state.getAccumulatedWatt() + wattReading;
        double newBalance = state.getCurrentBalance() + addedCost;
        state.setAccumulatedWatt(newWatt);
        state.setCurrentBalance(newBalance);

        // 4) Kota kontrolü
        double wattUsageRatio = newWatt / home.getPowerQuotaWatt();
        double budgetUsageRatio = newBalance / home.getBudgetQuotaTry();
        double maxRatio = Math.max(wattUsageRatio, budgetUsageRatio);

        // Önce Ignite'a yaz (şartname: "update Apache Ignite before Postgres")
        igniteService.putHomeState(homeId, state);

        // 5) BillingLedger (Postgres) güncelle
        BillingLedger ledger = billingLedgerRepository.findByHomeId(homeId)
                .orElseGet(() -> {
                    BillingLedger newLedger = new BillingLedger();
                    newLedger.setHome(home);
                    return newLedger;
                });
        ledger.setAccumulatedWatt(newWatt);
        ledger.setCurrentBalance(newBalance);
        ledger.setUpdatedAt(LocalDateTime.now());

        // 6) %80 breach kontrolü
        if (maxRatio >= BREACH_80_THRESHOLD && !ledger.getBreach80Notified()) {
            ledger.setBreach80Notified(true);
            logEvent(home, EventLog.EventType.BREACH_80,
                    String.format("{\"wattRatio\":%.3f,\"budgetRatio\":%.3f}", wattUsageRatio, budgetUsageRatio));
            System.out.println("⚠️  Home " + homeId + " reached 80% quota");
            alertNotificationService.notifyQuotaBreach(home, "BREACH_80");
        }

        // 7) %100 breach + penalty geçişi
        if (maxRatio >= BREACH_100_THRESHOLD && !ledger.getBreach100Notified()) {
            ledger.setBreach100Notified(true);
            ledger.setIsPenaltyActive(true);
            state.setIsPenaltyActive(true);
            igniteService.putHomeState(homeId, state);
            logEvent(home, EventLog.EventType.BREACH_100,
                    String.format("{\"wattRatio\":%.3f,\"budgetRatio\":%.3f}", wattUsageRatio, budgetUsageRatio));
            logEvent(home, EventLog.EventType.PENALTY_ACTIVATED,
                    String.format("{\"newRate\":%.2f}", home.getPenaltyRate()));
            System.out.println("🚨 Home " + homeId + " reached 100% quota - PENALTY ACTIVATED");
            alertNotificationService.notifyQuotaBreach(home, "BREACH_100");
        }

        billingLedgerRepository.save(ledger);
    }

    private void logEvent(Home home, EventLog.EventType type, String metadataJson) {
        EventLog log = new EventLog();
        log.setHome(home);
        log.setEventType(type);
        log.setMetadata(metadataJson);
        eventLogRepository.save(log);
    }
}