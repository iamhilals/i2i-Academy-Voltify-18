package com.voltify.core.service;

import java.util.List;

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
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        home.setOwner(currentUser);

        if (home.getAppliances() != null) {
            home.getAppliances().forEach(appliance -> appliance.setHome(home));
        }

        Home savedHome = homeRepository.save(home);

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
}