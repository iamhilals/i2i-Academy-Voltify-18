package com.voltify.core.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "homes")
public class Home {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String contactEmail;

    // Aylık güç kotası (Watt cinsinden)
    @Column(nullable = false)
    private Double powerQuotaWatt;

    // Aylık bütçe kotası (TL cinsinden)
    @Column(nullable = false)
    private Double budgetQuotaTry;

    // Normal tarif (TL/kWh)
    @Column(nullable = false)
    private Double baseRate;

    // Ceza tarifi (%100 kota aşımından sonra uygulanır)
    @Column(nullable = false)
    private Double penaltyRate;

    @OneToMany(mappedBy = "home", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Appliance> appliances;

    // Bu evin hangi kullanıcıya ait olduğunu belirten alan
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToOne(mappedBy = "home", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private BillingLedger billingLedger;

    @Column(nullable = true)
    private Integer squareMeters;

    @Column(nullable = true)
    private String roomLayout;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String imageUrl;

    // Getter ve Setter metotları
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public Double getPowerQuotaWatt() { return powerQuotaWatt; }
    public void setPowerQuotaWatt(Double powerQuotaWatt) { this.powerQuotaWatt = powerQuotaWatt; }

    public Double getBudgetQuotaTry() { return budgetQuotaTry; }
    public void setBudgetQuotaTry(Double budgetQuotaTry) { this.budgetQuotaTry = budgetQuotaTry; }

    public Double getBaseRate() { return baseRate; }
    public void setBaseRate(Double baseRate) { this.baseRate = baseRate; }

    public Double getPenaltyRate() { return penaltyRate; }
    public void setPenaltyRate(Double penaltyRate) { this.penaltyRate = penaltyRate; }

    public List<Appliance> getAppliances() { return appliances; }
    public void setAppliances(List<Appliance> appliances) { this.appliances = appliances; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public BillingLedger getBillingLedger() { return billingLedger; }
    public void setBillingLedger(BillingLedger billingLedger) { this.billingLedger = billingLedger; }

    public Integer getSquareMeters() { return squareMeters; }
    public void setSquareMeters(Integer squareMeters) { this.squareMeters = squareMeters; }

    public String getRoomLayout() { return roomLayout; }
    public void setRoomLayout(String roomLayout) { this.roomLayout = roomLayout; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}