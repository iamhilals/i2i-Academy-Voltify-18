package com.voltify.core.telemetry;

import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltify.core.entity.Appliance;
import com.voltify.core.entity.Home;
import com.voltify.core.repository.HomeRepository;

// Otonom simülasyon: kayıtlı her ev için, her cihaz için sahte watt üretip Kafka'ya basar.
// Dokümandaki "telemetry" ve "asset-registration" Kafka konuları ile tam uyumludur.
@Service
public class TelemetrySimulatorService {

    private static final String TELEMETRY_TOPIC = "telemetry";
    private static final String ASSET_REGISTRATION_TOPIC = "asset-registration";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private HomeRepository homeRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    // Dinamik Ev Kaydı (asset-registration dinleyicisi)
    @KafkaListener(topics = ASSET_REGISTRATION_TOPIC, groupId = "telemetry-simulator-group")
    public void listenAssetRegistration(String message) {
        try {
            System.out.println("🏠 Simülatör yeni ev/cihaz kaydı algıladı: " + message);
        } catch (Exception e) {
            System.err.println("Asset registration dinleme hatası: " + e.getMessage());
        }
    }

    // Her 2 saniyede bir çalışır ("every few seconds" gereksinimi)
    @Scheduled(fixedRate = 2000)
    public void generateTelemetry() {
        List<Home> homes = homeRepository.findAll();

        for (Home home : homes) {
            if (home.getAppliances() == null) continue;

            for (Appliance appliance : home.getAppliances()) {
                double randomWatt = calculateRealisticWatt(appliance);

                TelemetryEvent event = new TelemetryEvent();
                event.setHomeId(home.getId());
                event.setApplianceId(appliance.getId());
                event.setWatt(randomWatt);
                event.setTimestampMillis(System.currentTimeMillis());

                try {
                    String jsonMessage = objectMapper.writeValueAsString(event);
                    kafkaTemplate.send(TELEMETRY_TOPIC, jsonMessage);
                } catch (Exception e) {
                    System.err.println("Telemetry simülasyonu hatası: " + e.getMessage());
                }
            }
        }
    }

    // TSE / EPDK Standartlarına uygun gerçekçi cihaz güç tüketimi hesaplama
    private double calculateRealisticWatt(Appliance appliance) {
        if (appliance.getIsOn() != null && !appliance.getIsOn()) {
            return 0.0;
        }
        
        String name = appliance.getName() != null ? appliance.getName().toLowerCase() : "";
        double safeLimit = appliance.getSafePowerLimit() > 0 ? appliance.getSafePowerLimit() : 1500.0;
        
        double minWatt, maxWatt;
        if (name.contains("buzdolabı") || name.contains("fridge")) {
            minWatt = 40.0;
            maxWatt = 150.0;
        } else if (name.contains("kettle") || name.contains("su ısıtıcı")) {
            minWatt = 1800.0;
            maxWatt = 2400.0;
        } else if (name.contains("fırın") || name.contains("oven")) {
            minWatt = 1800.0;
            maxWatt = 3000.0;
        } else if (name.contains("televizyon") || name.contains("tv")) {
            minWatt = 50.0;
            maxWatt = 200.0;
        } else if (name.contains("klima") || name.contains("ac")) {
            minWatt = 600.0;
            maxWatt = 1800.0;
        } else if (name.contains("çamaşır") || name.contains("washing")) {
            minWatt = 300.0;
            maxWatt = 2000.0;
        } else {
            minWatt = safeLimit * 0.4;
            maxWatt = safeLimit * 0.9;
        }

        // %90 sağlıklı çalışma, %10 anormal ihlal testi
        if (random.nextDouble() < 0.9) {
            return minWatt + (maxWatt - minWatt) * random.nextDouble();
        } else {
            // Anomali: Güvenli sınırın 1.1x ila 1.35x katına sıçrama
            return safeLimit * (1.1 + random.nextDouble() * 0.25);
        }
    }
}