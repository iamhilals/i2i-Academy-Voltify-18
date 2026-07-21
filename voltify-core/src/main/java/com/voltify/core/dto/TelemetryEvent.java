package com.voltify.core.dto;

// Kafka'dan gelen telemetry mesajının şeması
// Her mesaj tek bir cihazın anlık watt ölçümünü taşır
public class TelemetryEvent {

    private Long homeId;
    private Long applianceId;
    private Double watt;
    private Long timestampMillis;

    public TelemetryEvent() {}

    public Long getHomeId() { return homeId; }
    public void setHomeId(Long homeId) { this.homeId = homeId; }

    public Long getApplianceId() { return applianceId; }
    public void setApplianceId(Long applianceId) { this.applianceId = applianceId; }

    public Double getWatt() { return watt; }
    public void setWatt(Double watt) { this.watt = watt; }

    public Long getTimestampMillis() { return timestampMillis; }
    public void setTimestampMillis(Long timestampMillis) { this.timestampMillis = timestampMillis; }
}