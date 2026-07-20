package com.voltify.core.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltify.core.entity.Home;
import com.voltify.core.repository.HomeRepository;

@Service
public class HomeService {

    private final HomeRepository homeRepository;
    private final KafkaProducerService kafkaProducerService;
    
    // ÇÖZÜM BURADA: ObjectMapper'ı Spring'den beklemek yerine doğrudan new kelimesiyle kendimiz üretiyoruz.
    private final ObjectMapper objectMapper = new ObjectMapper(); 

    // Constructor'dan (yapıcı metot) ObjectMapper'ı sildik.
    public HomeService(HomeRepository homeRepository, KafkaProducerService kafkaProducerService) {
        this.homeRepository = homeRepository;
        this.kafkaProducerService = kafkaProducerService;
    }

    public Home registerHome(Home home) {
        // 1. Cihazların hangi eve ait olduğunu belirtiyoruz
        if (home.getAppliances() != null) {
            home.getAppliances().forEach(appliance -> appliance.setHome(home));
        }
        
        // 2. PostgreSQL veritabanına kaydediyoruz
        Home savedHome = homeRepository.save(home);
        
        // 3. Kaydedilen evi JSON formatına çevirip Kafka'ya fırlatıyoruz
        try {
            String homeJson = objectMapper.writeValueAsString(savedHome);
            kafkaProducerService.sendMessage("home-registration-topic", homeJson);
        } catch (Exception e) {
            System.err.println("Kafka'ya mesaj gönderilirken hata oluştu: " + e.getMessage());
        }
        
        return savedHome;
    }
}