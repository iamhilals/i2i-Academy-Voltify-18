package com.voltify.core.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltify.core.entity.Home;
import com.voltify.core.entity.User;
import com.voltify.core.repository.HomeRepository;

@Service
public class HomeService {

    private final HomeRepository homeRepository;
    private final KafkaProducerService kafkaProducerService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HomeService(HomeRepository homeRepository, KafkaProducerService kafkaProducerService) {
        this.homeRepository = homeRepository;
        this.kafkaProducerService = kafkaProducerService;
    }

    public Home registerHome(Home home) {

        // 1. Şu an giriş yapmış kullanıcıyı SecurityContext'ten al
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 2. Bu evin sahibini otomatik olarak bu kullanıcı yap
        home.setOwner(currentUser);

        // 3. Cihazların hangi eve ait olduğunu belirt
        if (home.getAppliances() != null) {
            home.getAppliances().forEach(appliance -> appliance.setHome(home));
        }

        // 4. PostgreSQL veritabanına kaydet
        Home savedHome = homeRepository.save(home);

        // 5. Kaydedilen evi JSON formatına çevirip Kafka'ya fırlat
        try {
            String homeJson = objectMapper.writeValueAsString(savedHome);
            kafkaProducerService.sendMessage("home-registration-topic", homeJson);
        } catch (Exception e) {
            System.err.println("Kafka'ya mesaj gönderilirken hata oluştu: " + e.getMessage());
        }

        return savedHome;
    }
}