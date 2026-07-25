package com.voltify.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "eco_pets")
public class EcoPet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name = "VoltBot";

    @Column(nullable = false)
    private int healthScore = 100; // 0 - 100

    @Column(nullable = false)
    private int level = 1;

    @Column(nullable = false)
    private int experience = 0;

    @Column(nullable = false)
    private int foodCount = 5; // Start with 5 foods

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    public enum Mood {
        HAPPY, NEUTRAL, SAD, SICK
    }

    public Mood getMood() {
        if (healthScore <= 20) {
            return Mood.SICK;
        } else if (healthScore <= 50) {
            return Mood.SAD;
        } else if (healthScore <= 80) {
            return Mood.NEUTRAL;
        } else {
            return Mood.HAPPY;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getHealthScore() { return healthScore; }
    public void setHealthScore(int healthScore) {
        this.healthScore = Math.max(0, Math.min(100, healthScore));
    }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getExperience() { return experience; }
    public void setExperience(int experience) { this.experience = experience; }

    public int getFoodCount() { return foodCount; }
    public void setFoodCount(int foodCount) { this.foodCount = Math.max(0, foodCount); }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // XP ekler ve gerekirse seviye atlatır (feed + ödül mekanizması ortak kullanır)
    public void addExperience(int amount) {
        int currentExp = this.experience + amount;
        int threshold = this.level * 100;
        if (threshold > 0 && currentExp >= threshold) {
            this.level += 1;
            this.experience = currentExp - threshold;
        } else {
            this.experience = currentExp;
        }
    }
}
