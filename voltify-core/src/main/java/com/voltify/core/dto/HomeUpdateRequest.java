package com.voltify.core.dto;

// Ev güncelleme isteği. Tüm alanlar opsiyonel — sadece dolu olanlar güncellenir.
public class HomeUpdateRequest {

    private String name;
    private String contactEmail;
    private Double powerQuotaWatt;
    private Double budgetQuotaTry;
    private Double baseRate;
    private Double penaltyRate;
    private Integer squareMeters;
    private String roomLayout;

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

    public Integer getSquareMeters() { return squareMeters; }
    public void setSquareMeters(Integer squareMeters) { this.squareMeters = squareMeters; }

    public String getRoomLayout() { return roomLayout; }
    public void setRoomLayout(String roomLayout) { this.roomLayout = roomLayout; }
}