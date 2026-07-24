package com.voltify.core.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voltify.core.entity.EcoPet;
import com.voltify.core.entity.User;
import com.voltify.core.repository.EcoPetRepository;
import com.voltify.core.repository.UserRepository;

@Service
public class EcoPetService {

    private final EcoPetRepository ecoPetRepository;
    private final UserRepository userRepository;

    public EcoPetService(EcoPetRepository ecoPetRepository, UserRepository userRepository) {
        this.ecoPetRepository = ecoPetRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public EcoPet getOrCreatePet(User user) {
        Optional<EcoPet> petOpt = ecoPetRepository.findByUser(user);
        if (petOpt.isPresent()) {
            return petOpt.get();
        }

        EcoPet pet = new EcoPet();
        pet.setUser(user);
        pet.setName("VoltBot");
        pet.setHealthScore(100);
        pet.setLevel(1);
        pet.setExperience(0);
        pet.setFoodCount(5);
        return ecoPetRepository.save(pet);
    }

    @Transactional
    public EcoPet feedPet(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        EcoPet pet = getOrCreatePet(user);

        if (pet.getFoodCount() <= 0) {
            throw new RuntimeException("Beslemek için yeterli mamanız (Eco-Mama) kalmadı!");
        }

        pet.setFoodCount(pet.getFoodCount() - 1);
        pet.setHealthScore(pet.getHealthScore() + 15); // Beslemek canı doldurur
        
        // Deneyim ve Seviye atlama mantığı
        int currentExp = pet.getExperience() + 20;
        int nextLevelThreshold = pet.getLevel() * 100;
        if (currentExp >= nextLevelThreshold) {
            pet.setLevel(pet.getLevel() + 1);
            pet.setExperience(currentExp - nextLevelThreshold);
        } else {
            pet.setExperience(currentExp);
        }

        return ecoPetRepository.save(pet);
    }

    @Transactional
    public EcoPet applyAnomalyPenalty(Long userId, int penaltyAmount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        EcoPet pet = getOrCreatePet(user);

        pet.setHealthScore(pet.getHealthScore() - penaltyAmount);
        return ecoPetRepository.save(pet);
    }

    @Transactional
    public EcoPet awardFood(Long userId, int amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        EcoPet pet = getOrCreatePet(user);

        pet.setFoodCount(pet.getFoodCount() + amount);
        return ecoPetRepository.save(pet);
    }

    @Transactional
    public EcoPet renamePet(Long userId, String newName) {
        if (newName == null || newName.trim().isEmpty()) {
            throw new RuntimeException("İsim boş olamaz!");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        EcoPet pet = getOrCreatePet(user);

        pet.setName(newName.trim());
        return ecoPetRepository.save(pet);
    }
}
