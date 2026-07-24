package com.voltify.core.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteCache;
import org.springframework.stereotype.Service;

import com.voltify.core.ignite.ApplianceReading;
import com.voltify.core.ignite.HomeLiveState;

// Ignite cache'lerine erişim için wrapper.
// Diğer service'ler burayı kullansın, direkt Ignite API'siyle uğraşmasın.
@Service
public class IgniteService {

    // Cihaz bazında anomali eşiği (3 ardışık ihlal). TelemetryConsumerService ile aynı değer.
    public static final int ANOMALY_THRESHOLD = 3;

    // Cihaz geçmiş tamponu: 1 dakikada bir örnek, en fazla 24 saat (1440 nokta)
    private static final long HISTORY_SAMPLE_INTERVAL_MS = 60_000L;
    private static final int HISTORY_MAX_POINTS = 1440;

    // Watt toplamını kWh'e çeviren SI faktörü (dt=2sn): kWh = ΣWatt / 1.800.000
    public static final double WATT_SUM_TO_KWH = 1_800_000.0;

    private final IgniteCache<Long, HomeLiveState> homeStateCache;
    private final IgniteCache<Long, Integer> breachCounterCache;
    private final IgniteCache<Long, Double> applianceWattCache;
    private final IgniteCache<Long, ArrayList<ApplianceReading>> applianceHistoryCache;
    private final IgniteCache<Long, Double> applianceCumulativeWattCache;

    public IgniteService(Ignite ignite) {
        this.homeStateCache = ignite.getOrCreateCache("homeLiveState");
        this.breachCounterCache = ignite.getOrCreateCache("applianceBreachCounter");
        this.applianceWattCache = ignite.getOrCreateCache("applianceLiveWatt");
        this.applianceHistoryCache = ignite.getOrCreateCache("applianceHistory");
        this.applianceCumulativeWattCache = ignite.getOrCreateCache("applianceCumulativeWatt");
    }

    // Home live state - ev için mevcut state'i getir, yoksa yeni oluştur
    public HomeLiveState getOrCreateHomeState(Long homeId) {
        HomeLiveState state = homeStateCache.get(homeId);
        if (state == null) {
            state = new HomeLiveState(homeId);
            homeStateCache.put(homeId, state);
        }
        return state;
    }

    public HomeLiveState getHomeState(Long homeId) {
        return homeStateCache.get(homeId);
    }

    public void putHomeState(Long homeId, HomeLiveState state) {
        state.setLastUpdatedMillis(System.currentTimeMillis());
        homeStateCache.put(homeId, state);
    }

    // Breach counter - cihaz bazında ardışık aşım sayacı
    public int incrementBreachCounter(Long applianceId) {
        Integer current = breachCounterCache.get(applianceId);
        int newValue = (current == null ? 0 : current) + 1;
        breachCounterCache.put(applianceId, newValue);
        return newValue;
    }

    public void resetBreachCounter(Long applianceId) {
        breachCounterCache.put(applianceId, 0);
    }

    public int getBreachCounter(Long applianceId) {
        Integer value = breachCounterCache.get(applianceId);
        return value == null ? 0 : value;
    }

    // Cihazın 3+ ardışık ihlalle anomali durumunda olup olmadığı (canlı UI için)
    public boolean isApplianceAnomalous(Long applianceId) {
        return getBreachCounter(applianceId) >= ANOMALY_THRESHOLD;
    }

    // Cihazın son ölçülen anlık watt değeri (canlı UI için)
    public void putApplianceWatt(Long applianceId, Double watt) {
        applianceWattCache.put(applianceId, watt);
    }

    public double getApplianceWatt(Long applianceId) {
        Double value = applianceWattCache.get(applianceId);
        return value == null ? 0.0 : value;
    }

    // Cihazın kümülatif watt toplamı (toplam enerji hesabı için). Her ölçümde artar.
    public void addApplianceCumulativeWatt(Long applianceId, double watt) {
        Double current = applianceCumulativeWattCache.get(applianceId);
        applianceCumulativeWattCache.put(applianceId, (current == null ? 0.0 : current) + watt);
    }

    public double getApplianceCumulativeWatt(Long applianceId) {
        Double value = applianceCumulativeWattCache.get(applianceId);
        return value == null ? 0.0 : value;
    }

    // Cihazın şimdiye kadarki toplam tüketimi (kWh)
    public double getApplianceTotalKwh(Long applianceId) {
        return getApplianceCumulativeWatt(applianceId) / WATT_SUM_TO_KWH;
    }

    // Cihaz geçmişine ölçüm ekle. Dakikada bir örnekler (throttle) ve en fazla
    // 24 saatlik pencere tutar. Grafiğin 1s/6s/24s geçmişini GERÇEK veriyle besler.
    public void recordApplianceReading(Long applianceId, double watt) {
        long now = System.currentTimeMillis();
        ArrayList<ApplianceReading> list = applianceHistoryCache.get(applianceId);
        if (list == null) {
            list = new ArrayList<>();
        } else if (!list.isEmpty()
                && now - list.get(list.size() - 1).getTimestampMillis() < HISTORY_SAMPLE_INTERVAL_MS) {
            return; // Son örnekten 1 dakika geçmedi - atla
        }
        list.add(new ApplianceReading(now, Math.round(watt)));
        while (list.size() > HISTORY_MAX_POINTS) {
            list.remove(0);
        }
        applianceHistoryCache.put(applianceId, list);
    }

    // Verilen zamandan (sinceMillis) sonraki cihaz ölçümlerini döndürür
    public List<ApplianceReading> getApplianceHistory(Long applianceId, long sinceMillis) {
        ArrayList<ApplianceReading> list = applianceHistoryCache.get(applianceId);
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }
        List<ApplianceReading> out = new ArrayList<>();
        for (ApplianceReading r : list) {
            if (r.getTimestampMillis() >= sinceMillis) {
                out.add(r);
            }
        }
        return out;
    }
}