package com.voltify.core.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.ConsumptionSnapshot;
import com.voltify.core.entity.Home;
import com.voltify.core.entity.User;
import com.voltify.core.repository.BillingLedgerRepository;
import com.voltify.core.repository.HomeRepository;
import com.voltify.core.repository.ConsumptionSnapshotRepository;

@Service
public class HomeService {

    private final HomeRepository homeRepository;
    private final BillingLedgerRepository billingLedgerRepository;
    private final KafkaProducerService kafkaProducerService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ConsumptionSnapshotRepository consumptionSnapshotRepository;

    public HomeService(HomeRepository homeRepository,
                    BillingLedgerRepository billingLedgerRepository,
                    ConsumptionSnapshotRepository consumptionSnapshotRepository,
                    KafkaProducerService kafkaProducerService) {
        this.homeRepository = homeRepository;
        this.billingLedgerRepository = billingLedgerRepository;
        this.consumptionSnapshotRepository = consumptionSnapshotRepository;
        this.kafkaProducerService = kafkaProducerService;
    }

    @Transactional
    public Home registerHome(Home home) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        home.setOwner(currentUser);

        if (home.getAppliances() != null) {
            home.getAppliances().forEach(appliance -> appliance.setHome(home));
        }

        // Ev PostgreSQL'e kaydediliyor
        Home savedHome = homeRepository.save(home);

        // Her yeni ev için otomatik olarak boş bir BillingLedger oluşturuluyor
        BillingLedger ledger = new BillingLedger();
        ledger.setHome(savedHome);
        BillingLedger savedLedger = billingLedgerRepository.save(ledger);
        savedHome.setBillingLedger(savedLedger);

        // Kafka'ya asset registration event'i gönderiliyor
        try {
            String homeJson = objectMapper.writeValueAsString(savedHome);
            kafkaProducerService.sendMessage("home-registration-topic", homeJson);
        } catch (Exception e) {
            System.err.println("Kafka'ya mesaj gönderilirken hata oluştu: " + e.getMessage());
        }

        return savedHome;
    }

    public List<Home> getMyHomes() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return homeRepository.findByOwner(currentUser);
    }

    // Şartname: Home Status Delivery - Ignite'tan okumalı ama Ignite henüz yok
    // Şimdilik PostgreSQL'den okuyoruz, Ignite eklenince buradan geçireceğiz
    public Home getHomeStatus(Long homeId) {
        return homeRepository.findById(homeId)
            .orElseThrow(() -> new RuntimeException("Home not found: " + homeId));
    }

    // Şartname: Historical Trend Delivery - PostgreSQL'den
    public List<ConsumptionSnapshot> getHomeHistory(Long homeId) {
        return consumptionSnapshotRepository.findByHomeIdOrderBySnapshotDateAsc(homeId);
    }

    // Frontend dashboard grid için - tüm evleri listeler
    public List<Home> getAllHomes() {
        return homeRepository.findAll();
    }
}