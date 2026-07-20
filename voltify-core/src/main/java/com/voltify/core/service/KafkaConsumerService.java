package com.voltify.core.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    // voltify-group isimli grup, home-registration-topic kuyruğunu sürekli dinler
    @KafkaListener(topics = "home-registration-topic", groupId = "voltify-group")
    public void listenHomeRegistration(String message) {
        System.out.println("🚨 KAFKA'DAN MESAJ YAKALANDI: " + message);
        
        // TODO: Projenin ilerleyen aşamalarında AI tavsiyeleri veya Ignite önbellek işlemleri burada tetiklenecek.
    }
}