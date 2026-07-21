package com.voltify.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "consumption_snapshots")
public class ConsumptionSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "home_id", nullable = false)
    @JsonIgnore
    private Home home;

    // Hangi güne ait snapshot
    @Column(nullable = false)
    private LocalDate snapshotDate;

    // O gün tüketilen toplam watt
    @Column(nullable = false)
    private Double dailyWatt;

    // O gün oluşan fatura tutarı (TL)
    @Column(nullable = false)
    private Double dailyCost;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Home getHome() { return home; }
    public void setHome(Home home) { this.home = home; }

    public LocalDate getSnapshotDate() { return snapshotDate; }
    public void setSnapshotDate(LocalDate snapshotDate) { this.snapshotDate = snapshotDate; }

    public Double getDailyWatt() { return dailyWatt; }
    public void setDailyWatt(Double dailyWatt) { this.dailyWatt = dailyWatt; }

    public Double getDailyCost() { return dailyCost; }
    public void setDailyCost(Double dailyCost) { this.dailyCost = dailyCost; }
}