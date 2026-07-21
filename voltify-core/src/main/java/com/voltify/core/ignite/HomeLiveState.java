package com.voltify.core.ignite;

import java.io.Serializable;

// Ignite'ta tutulan canlı ev durumu — ephemeral, sub-ms okuma için
public class HomeLiveState implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long homeId;
    private Double accumulatedWatt;
    private Double currentBalance;
    private Boolean isPenaltyActive;
    private Long lastUpdatedMillis;

    public HomeLiveState() {}

    public HomeLiveState(Long homeId) {
        this.homeId = homeId;
        this.accumulatedWatt = 0.0;
        this.currentBalance = 0.0;
        this.isPenaltyActive = false;
        this.lastUpdatedMillis = System.currentTimeMillis();
    }

    public Long getHomeId() { return homeId; }
    public void setHomeId(Long homeId) { this.homeId = homeId; }

    public Double getAccumulatedWatt() { return accumulatedWatt; }
    public void setAccumulatedWatt(Double accumulatedWatt) { this.accumulatedWatt = accumulatedWatt; }

    public Double getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(Double currentBalance) { this.currentBalance = currentBalance; }

    public Boolean getIsPenaltyActive() { return isPenaltyActive; }
    public void setIsPenaltyActive(Boolean isPenaltyActive) { this.isPenaltyActive = isPenaltyActive; }

    public Long getLastUpdatedMillis() { return lastUpdatedMillis; }
    public void setLastUpdatedMillis(Long lastUpdatedMillis) { this.lastUpdatedMillis = lastUpdatedMillis; }
}