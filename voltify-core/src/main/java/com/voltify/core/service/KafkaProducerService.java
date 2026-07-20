package com.voltify.core.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    // İstediğimiz kuyruğa (topic) mesaj göndermemizi sağlayan metot
    public void sendMessage(String topic, String message) {
        kafkaTemplate.send(topic, message);
        System.out.println("Kafka'ya mesaj fırlatıldı -> Topic: " + topic + " | Mesaj: " + message);
    }
}