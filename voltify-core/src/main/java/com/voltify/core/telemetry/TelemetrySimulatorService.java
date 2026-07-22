package com.voltify.core.telemetry;

import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltify.core.entity.Appliance;
import com.voltify.core.entity.Home;
import com.voltify.core.repository.HomeRepository;

// Otonom simülasyon: kayıtlı her ev için, her cihaz için sahte watt üretip Kafka'ya basar.
// Dokümandaki "Telemetry Data Generation" gereksinimini karşılar.
@Service
public class TelemetrySimulatorService {

    private static final String TOPIC = "appliance-telemetry-topic";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private HomeRepository homeRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    // Her 2 saniyede bir çalışır ("every few seconds" gereksinimi)
    @Scheduled(fixedRate = 2000)
    public void generateTelemetry() {
        List<Home> homes = homeRepository.findAll();

        for (Home home : homes) {
            if (home.getAppliances() == null) continue;

            for (Appliance appliance : home.getAppliances()) {
                double safeLimit = appliance.getSafePowerLimit();
                double randomWatt;

                // Gerçekçi dağılım: %90 sağlıklı çalışma, %10 anormal tüketim
                if (random.nextDouble() < 0.9) {
                    // Sağlıklı: safe limit'in %60-95'i arası
                    randomWatt = safeLimit * (0.6 + random.nextDouble() * 0.35);
                } else {
                    // Anormal: safe limit'in %105-130'u arası
                    randomWatt = safeLimit * (1.05 + random.nextDouble() * 0.25);
                }

                TelemetryEvent event = new TelemetryEvent();
                event.setHomeId(home.getId());
                event.setApplianceId(appliance.getId());
                event.setWatt(randomWatt);
                event.setTimestampMillis(System.currentTimeMillis());

                try {
                    String jsonMessage = objectMapper.writeValueAsString(event);
                    kafkaTemplate.send(TOPIC, jsonMessage);
                } catch (Exception e) {
                    System.err.println("Telemetry simülasyonu hatası: " + e.getMessage());
                }
            }
        }
    }
}