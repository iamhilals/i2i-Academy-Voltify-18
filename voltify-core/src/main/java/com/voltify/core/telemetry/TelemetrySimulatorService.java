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

// Otonom simülasyon motoru: kayıtlı her ev için, her cihaz için
// periyodik olarak sahte watt verisi üretip Kafka'ya basar.
// Dokümandaki "Telemetry Data Generation" gereksinimi.
@Service
public class TelemetrySimulatorService {

    private static final String TOPIC = "appliance-telemetry-topic";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private HomeRepository homeRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    // Her 5 saniyede bir çalışır. fixedRate = milisaniye cinsinden.
    @Scheduled(fixedRate = 1000)
    public void generateTelemetry() {
        // PostgreSQL'den tüm kayıtlı evleri çek
        List<Home> homes = homeRepository.findAll();

        for (Home home : homes) {
            if (home.getAppliances() == null) continue;

            for (Appliance appliance : home.getAppliances()) {
                // Cihazın güvenli limitinin %50-%150'i arasında rastgele bir watt üret
                // Böylece bazen normal, bazen limitin üstünde değerler oluşacak - anomali tespitini tetikler
                double safeLimit = appliance.getSafePowerLimit();
                double randomWatt = safeLimit * (0.5 + random.nextDouble());

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