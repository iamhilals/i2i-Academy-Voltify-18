package com.voltify.core.service;

import org.springframework.stereotype.Service;

import com.voltify.core.entity.Home;
import com.voltify.core.repository.HomeRepository;

@Service
public class HomeService {

    private final HomeRepository homeRepository;

    public HomeService(HomeRepository homeRepository) {
        this.homeRepository = homeRepository;
    }

    public Home registerHome(Home home) {
        // Cihazların hangi eve ait olduğunu belirtmek için aralarındaki bağı kuruyoruz
        if (home.getAppliances() != null) {
            home.getAppliances().forEach(appliance -> appliance.setHome(home));
        }
        
        // Veritabanına (PostgreSQL) kaydetme işlemi[cite: 1]
        Home savedHome = homeRepository.save(home);
        
        // TODO: Proje dokümanında istenen Apache Kafka 'registration' kuyruğuna mesaj gönderme işlemini[cite: 1] daha sonra buraya ekleyeceğiz.
        
        return savedHome;
    }
}