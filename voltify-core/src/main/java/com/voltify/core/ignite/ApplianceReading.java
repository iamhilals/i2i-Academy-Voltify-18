package com.voltify.core.ignite;

import java.io.Serializable;

public class ApplianceReading implements Serializable {
    private static final long serialVersionUID = 1L;

    private long timestampMillis;
    private long watt;

    public ApplianceReading() {}

    public ApplianceReading(long timestampMillis, long watt) {
        this.timestampMillis = timestampMillis;
        this.watt = watt;
    }

    public long getTimestampMillis() {
        return timestampMillis;
    }

    public void setTimestampMillis(long timestampMillis) {
        this.timestampMillis = timestampMillis;
    }

    public long getWatt() {
        return watt;
    }

    public void setWatt(long watt) {
        this.watt = watt;
    }
}
