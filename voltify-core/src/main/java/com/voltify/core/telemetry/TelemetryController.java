package com.voltify.core.telemetry;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    // @Autowired KALDIRILDI! Spring'den istemek yerine doğrudan kendimiz oluşturuyoruz.
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String TOPIC = "appliance-telemetry-topic";

    @PostMapping("/send")
    public ResponseEntity<String> sendTelemetry(@RequestBody TelemetryEvent event) {
        try {
            // 1. Gelen Java objesini JSON metnine (String) çevir
            String jsonMessage = objectMapper.writeValueAsString(event);
            
            // 2. Metne çevrilmiş veriyi Kafka'ya fırlat
            kafkaTemplate.send(TOPIC, jsonMessage);
            
            return ResponseEntity.ok("Harika! Sensör verisi başarıyla Kafka kuyruğuna fırlatıldı.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Kafka'ya gönderirken hata: " + e.getMessage());
        }
    }
}