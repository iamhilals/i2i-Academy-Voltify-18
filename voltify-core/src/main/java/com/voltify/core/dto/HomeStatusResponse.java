package com.voltify.core.dto;

import java.util.List;
import com.voltify.core.entity.Appliance;

public class HomeStatusResponse {

    // PostgreSQL'den gelen statik/kalıcı bilgiler
    private Long id;
    private String name;
    private String contactEmail;
    private Double powerQuotaWatt;
    private Double budgetQuotaTry;
    private Double baseRate;
    private Double penaltyRate;
    private List<Appliance> appliances;
    private Integer squareMeters;
    private String roomLayout;

    // Ignite'tan gelen anlık/canlı bilgiler
    private Double accumulatedWatt;
    private Double currentBalance;
    private Boolean isPenaltyActive;
    private Long lastUpdatedMillis;

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

    public Integer getSquareMeters() { return squareMeters; }
    public void setSquareMeters(Integer squareMeters) { this.squareMeters = squareMeters; }

    public String getRoomLayout() { return roomLayout; }
    public void setRoomLayout(String roomLayout) { this.roomLayout = roomLayout; }

    public Double getAccumulatedWatt() { return accumulatedWatt; }
    public void setAccumulatedWatt(Double accumulatedWatt) { this.accumulatedWatt = accumulatedWatt; }

    public Double getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(Double currentBalance) { this.currentBalance = currentBalance; }

    public Boolean getIsPenaltyActive() { return isPenaltyActive; }
    public void setIsPenaltyActive(Boolean isPenaltyActive) { this.isPenaltyActive = isPenaltyActive; }

    public Long getLastUpdatedMillis() { return lastUpdatedMillis; }
    public void setLastUpdatedMillis(Long lastUpdatedMillis) { this.lastUpdatedMillis = lastUpdatedMillis; }
}