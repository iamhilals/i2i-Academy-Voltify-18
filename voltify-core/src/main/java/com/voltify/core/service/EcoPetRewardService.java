package com.voltify.core.service;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voltify.core.entity.EcoPet;
import com.voltify.core.entity.Home;
import com.voltify.core.entity.User;
import com.voltify.core.ignite.HomeLiveState;
import com.voltify.core.repository.EcoPetRepository;
import com.voltify.core.repository.HomeRepository;

// İyi enerji davranışını ÖDÜLLENDİREN periyodik mekanizma.
// Kullanıcının hiçbir evi ceza (penalty) durumunda değilse pet'e sağlık + mama + XP verir.
// Böylece maskot iki yönlü olur: cihaz anomalisi sağlığı düşürür, iyi davranış toparlar
// ve mama yeniden dolduğu için besleme sürdürülebilir hale gelir.
@Service
public class EcoPetRewardService {

    private static final int MAX_FOOD = 10;
    private static final int HEALTH_REWARD = 10;
    private static final int FOOD_REWARD = 1;
    private static final int XP_REWARD = 15;

    private final EcoPetRepository ecoPetRepository;
    private final HomeRepository homeRepository;
    private final IgniteService igniteService;

    public EcoPetRewardService(EcoPetRepository ecoPetRepository,
                               HomeRepository homeRepository,
                               IgniteService igniteService) {
        this.ecoPetRepository = ecoPetRepository;
        this.homeRepository = homeRepository;
        this.igniteService = igniteService;
    }

    @Scheduled(fixedDelayString = "${voltify.ecopet.reward-interval-ms:20000}")
    @Transactional
    public void rewardGoodBehavior() {
        List<EcoPet> pets = ecoPetRepository.findAll();
        int rewarded = 0;

        for (EcoPet pet : pets) {
            User owner = pet.getUser();
            if (owner == null) continue;

            List<Home> homes = homeRepository.findByOwner(owner);
            boolean anyPenalty = homes.stream().anyMatch(h -> {
                HomeLiveState state = igniteService.getHomeState(h.getId());
                return state != null && Boolean.TRUE.equals(state.getIsPenaltyActive());
            });
            if (anyPenalty) continue; // Ceza durumundaysa ödül yok

            pet.setHealthScore(pet.getHealthScore() + HEALTH_REWARD); // setter 0-100 clamp'liyor
            pet.setFoodCount(Math.min(pet.getFoodCount() + FOOD_REWARD, MAX_FOOD));
            pet.addExperience(XP_REWARD);
            rewarded++;
        }

        if (rewarded > 0) {
            ecoPetRepository.saveAll(pets);
        }
    }
}
