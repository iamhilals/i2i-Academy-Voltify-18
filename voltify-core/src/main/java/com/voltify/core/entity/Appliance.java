package com.voltify.core.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "appliances")
public class Appliance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Cihazın normal kabul edilen maksimum güç limiti (Watt)
    private Double safePowerLimit;

    // Cihazın hangi eve ait olduğunu belirten ilişki (Foreign Key)
    @ManyToOne
    @JoinColumn(name = "home_id", nullable = false)
    @JsonBackReference // Çocuk (Bağlı) taraf burası, döngüyü bu durduracak
    private Home home;

    // Getter ve Setter metotları
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getSafePowerLimit() { return safePowerLimit; }
    public void setSafePowerLimit(Double safePowerLimit) { this.safePowerLimit = safePowerLimit; }

    public Home getHome() { return home; }
    public void setHome(Home home) { this.home = home; }
}