package com.voltify.core.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "homes")
public class Home {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String contactEmail;

    @OneToMany(mappedBy = "home", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Appliance> appliances;

    // Bu evin hangi kullanıcıya ait olduğunu belirten alan
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // Getter ve Setter metotları
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public List<Appliance> getAppliances() { return appliances; }
    public void setAppliances(List<Appliance> appliances) { this.appliances = appliances; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}