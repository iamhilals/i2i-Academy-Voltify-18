package com.voltify.core.dto;

// Cihazın canlı durumu: statik bilgiler (PostgreSQL) + anlık watt & anomali (Ignite).
// Frontend'in cihaz kartlarında anlık tüketimi ve anomali işaretini göstermesi için kullanılır.
public class ApplianceStatus {

    private Long id;
    private String name;
    private String room;
    private String type;

    // Ignite'tan gelen canlı değerler
    private double currentWattage;   // son ölçülen anlık güç (Watt)
    private double maxSafeWattage;   // güvenli güç limiti (Watt)
    private boolean isAnomalous;     // 3+ ardışık ihlal ile anomali mi?
    private double totalKwh;         // şimdiye kadarki toplam tüketim (kWh)
    private double totalCost;        // toplam tüketimin tahmini maliyeti (TL)

    public ApplianceStatus() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getCurrentWattage() { return currentWattage; }
    public void setCurrentWattage(double currentWattage) { this.currentWattage = currentWattage; }

    public double getMaxSafeWattage() { return maxSafeWattage; }
    public void setMaxSafeWattage(double maxSafeWattage) { this.maxSafeWattage = maxSafeWattage; }

    public boolean getIsAnomalous() { return isAnomalous; }
    public void setIsAnomalous(boolean isAnomalous) { this.isAnomalous = isAnomalous; }

    public double getTotalKwh() { return totalKwh; }
    public void setTotalKwh(double totalKwh) { this.totalKwh = totalKwh; }

    public double getTotalCost() { return totalCost; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }
}
