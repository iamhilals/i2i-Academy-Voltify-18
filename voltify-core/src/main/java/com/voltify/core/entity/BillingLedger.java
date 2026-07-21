package com.voltify.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "billing_ledgers")
public class BillingLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Her evin tek bir ledger kaydı olur (One-to-One)
    @OneToOne
    @JoinColumn(name = "home_id", nullable = false, unique = true)
    @JsonIgnore
    private Home home;

    // Şimdiye kadar tüketilen toplam güç (Watt cinsinden birikimli)
    @Column(nullable = false)
    private Double accumulatedWatt = 0.0;

    // Şimdiye kadar birikmiş toplam fatura tutarı (TL)
    @Column(nullable = false)
    private Double currentBalance = 0.0;

    // Ev %100 kotayı aştı mı? Aştıysa penalty tarifi uygulanıyor
    @Column(nullable = false)
    private Boolean isPenaltyActive = false;

    // %80 breach alerti daha önce tetiklendi mi? (Aynı alerti tekrar göndermemek için)
    @Column(nullable = false)
    private Boolean breach80Notified = false;

    // %100 breach alerti daha önce tetiklendi mi?
    @Column(nullable = false)
    private Boolean breach100Notified = false;

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Home getHome() { return home; }
    public void setHome(Home home) { this.home = home; }

    public Double getAccumulatedWatt() { return accumulatedWatt; }
    public void setAccumulatedWatt(Double accumulatedWatt) { this.accumulatedWatt = accumulatedWatt; }

    public Double getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(Double currentBalance) { this.currentBalance = currentBalance; }

    public Boolean getIsPenaltyActive() { return isPenaltyActive; }
    public void setIsPenaltyActive(Boolean isPenaltyActive) { this.isPenaltyActive = isPenaltyActive; }

    public Boolean getBreach80Notified() { return breach80Notified; }
    public void setBreach80Notified(Boolean breach80Notified) { this.breach80Notified = breach80Notified; }

    public Boolean getBreach100Notified() { return breach100Notified; }
    public void setBreach100Notified(Boolean breach100Notified) { this.breach100Notified = breach100Notified; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}