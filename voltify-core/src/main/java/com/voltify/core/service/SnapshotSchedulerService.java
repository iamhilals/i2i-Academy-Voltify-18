package com.voltify.core.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.ConsumptionSnapshot;
import com.voltify.core.entity.Home;
import com.voltify.core.repository.BillingLedgerRepository;
import com.voltify.core.repository.ConsumptionSnapshotRepository;
import com.voltify.core.repository.HomeRepository;

// Belirli aralıklarla her ev için consumption snapshot alır.
// Gerçek üretimde günlük çalıştırılır, dev'de daha sık - konfigüre edilebilir.
@Service
public class SnapshotSchedulerService {

    private final HomeRepository homeRepository;
    private final BillingLedgerRepository billingLedgerRepository;
    private final ConsumptionSnapshotRepository consumptionSnapshotRepository;

    public SnapshotSchedulerService(HomeRepository homeRepository,
                                     BillingLedgerRepository billingLedgerRepository,
                                     ConsumptionSnapshotRepository consumptionSnapshotRepository) {
        this.homeRepository = homeRepository;
        this.billingLedgerRepository = billingLedgerRepository;
        this.consumptionSnapshotRepository = consumptionSnapshotRepository;
    }

    // Her 30 saniyede bir çalışır (dev için).
    // Production'da fixedDelayString ile env'den okunabilir: "${snapshot.interval:30000}"
    @Scheduled(fixedDelayString = "${voltify.snapshot.interval-ms:30000}")
    @Transactional
    public void captureDailySnapshots() {
        List<Home> allHomes = homeRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Home home : allHomes) {
            Optional<BillingLedger> ledgerOpt = billingLedgerRepository.findByHomeId(home.getId());
            if (ledgerOpt.isEmpty()) continue;

            BillingLedger ledger = ledgerOpt.get();

            // Bugüne ait snapshot var mı? Varsa güncelle, yoksa yeni oluştur.
            Optional<ConsumptionSnapshot> existingOpt =
                    consumptionSnapshotRepository.findByHomeAndSnapshotDate(home, today);

            ConsumptionSnapshot snapshot = existingOpt.orElseGet(() -> {
                ConsumptionSnapshot newSnap = new ConsumptionSnapshot();
                newSnap.setHome(home);
                newSnap.setSnapshotDate(today);
                return newSnap;
            });

            snapshot.setDailyWatt(ledger.getAccumulatedWatt());
            snapshot.setDailyCost(ledger.getCurrentBalance());
            consumptionSnapshotRepository.save(snapshot);
        }

        if (!allHomes.isEmpty()) {
            System.out.println("📊 Snapshot alındı: " + allHomes.size() + " ev, tarih=" + today);
        }
    }
}