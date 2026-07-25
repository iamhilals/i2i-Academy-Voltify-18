package com.voltify.core.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.Home;
import com.voltify.core.repository.BillingLedgerRepository;
import com.voltify.core.repository.HomeRepository;

// Uygulama başlarken PostgreSQL'i fresh Ignite durumuyla senkronlar:
//  1) Tüm billing ledger'ların canlı alanlarını sıfırlar (Ignite bellek-içi olduğu
//     için restart'ta sıfırlanır; böylece dashboard ve ev detayı tutarlı başlar,
//     kota aşılınca penalty/uyarılar yeniden tetiklenebilir).
//  2) Eski düşük güç kotası (3500W) varsayılanlı evleri gerçekçi 8800W'a yükseltir
//     (fırın gibi cihazlar 3500W'ı kolayca aşıp evi sürekli cezaya sokuyordu).
// Not: Kalıcı günlük geçmiş consumption_snapshots tablosunda korunur.
@Component
@Order(1)
public class LedgerResetOnStartup implements ApplicationRunner {

    private static final double OLD_DEFAULT_POWER_QUOTA = 3500.0;
    private static final double NEW_DEFAULT_POWER_QUOTA = 8800.0;

    private final BillingLedgerRepository billingLedgerRepository;
    private final HomeRepository homeRepository;

    public LedgerResetOnStartup(BillingLedgerRepository billingLedgerRepository,
                                HomeRepository homeRepository) {
        this.billingLedgerRepository = billingLedgerRepository;
        this.homeRepository = homeRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // 1) Ledger'ları sıfırla
        List<BillingLedger> ledgers = billingLedgerRepository.findAll();
        for (BillingLedger ledger : ledgers) {
            ledger.setAccumulatedWatt(0.0);
            ledger.setCurrentBalance(0.0);
            ledger.setIsPenaltyActive(false);
            ledger.setBreach80Notified(false);
            ledger.setBreach100Notified(false);
            ledger.setUpdatedAt(LocalDateTime.now());
        }
        billingLedgerRepository.saveAll(ledgers);
        System.out.println("🔄 " + ledgers.size() + " billing ledger sıfırlandı (Ignite ile senkron başlangıç)");

        // 2) Eski düşük güç kotasını gerçekçi değere yükselt (yalnızca eski varsayılan)
        List<Home> homes = homeRepository.findAll();
        int bumped = 0;
        for (Home home : homes) {
            if (home.getPowerQuotaWatt() != null && home.getPowerQuotaWatt() == OLD_DEFAULT_POWER_QUOTA) {
                home.setPowerQuotaWatt(NEW_DEFAULT_POWER_QUOTA);
                bumped++;
            }
        }
        if (bumped > 0) {
            homeRepository.saveAll(homes);
            System.out.println("⚡ " + bumped + " evin güç kotası " + (int) NEW_DEFAULT_POWER_QUOTA + "W'a güncellendi");
        }
    }
}
