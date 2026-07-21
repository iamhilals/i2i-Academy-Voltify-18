package com.voltify.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "ai_recommendations")
public class AiRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "home_id", nullable = false)
    @JsonIgnore
    private Home home;

    // Gemini'nin ürettiği Türkçe tavsiye metni
    @Column(nullable = false, columnDefinition = "TEXT")
    private String generatedText;

    // Hangi olay bu tavsiyeyi tetikledi (BREACH_80, ANOMALY_DETECTED vs.)
    @Column(nullable = false, length = 50)
    private String triggerContext;

    // Email gönderildi mi?
    @Column(nullable = false)
    private Boolean emailSent = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Home getHome() { return home; }
    public void setHome(Home home) { this.home = home; }

    public String getGeneratedText() { return generatedText; }
    public void setGeneratedText(String generatedText) { this.generatedText = generatedText; }

    public String getTriggerContext() { return triggerContext; }
    public void setTriggerContext(String triggerContext) { this.triggerContext = triggerContext; }

    public Boolean getEmailSent() { return emailSent; }
    public void setEmailSent(Boolean emailSent) { this.emailSent = emailSent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}