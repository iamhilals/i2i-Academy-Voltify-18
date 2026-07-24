package com.voltify.core.telemetry;

import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

// Manuel telemetry enjeksiyonu (Swagger üzerinden test için).
// Otonom akış TelemetrySimulatorService tarafından üretilir; bu endpoint aynı
// 'telemetry' konusuna yazar, böylece gönderilen ölçüm gerçek işleme hattına girer.
@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    private static final String TELEMETRY_TOPIC = "telemetry";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TelemetryController(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendTelemetry(@RequestBody TelemetryEvent event) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TELEMETRY_TOPIC, jsonMessage);
            return ResponseEntity.ok("Telemetry ölçümü '" + TELEMETRY_TOPIC + "' Kafka konusuna gönderildi.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Kafka'ya gönderim hatası: " + e.getMessage());
        }
    }
}
