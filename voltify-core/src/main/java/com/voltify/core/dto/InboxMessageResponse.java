package com.voltify.core.dto;

import java.time.LocalDateTime;

// Gelen kutusu mesajı: penalty/anomali tetiklendiğinde üretilip e-posta olarak
// gönderilen AI tavsiyesinin (ai_recommendations) kullanıcıya dönük görünümü.
public class InboxMessageResponse {

    private Long id;
    private String category;      // BREACH_80 | BREACH_100 | ANOMALY_DETECTED
    private String homeName;
    private String body;          // Gemini üretimi Türkçe e-posta metni
    private LocalDateTime createdAt;
    private boolean emailSent;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getHomeName() { return homeName; }
    public void setHomeName(String homeName) { this.homeName = homeName; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean getEmailSent() { return emailSent; }
    public void setEmailSent(boolean emailSent) { this.emailSent = emailSent; }
}
