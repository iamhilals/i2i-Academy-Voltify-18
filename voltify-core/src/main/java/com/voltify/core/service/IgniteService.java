package com.voltify.core.service;

import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteCache;
import org.springframework.stereotype.Service;

import com.voltify.core.ignite.HomeLiveState;

// Ignite cache'lerine erişim için wrapper.
// Diğer service'ler burayı kullansın, direkt Ignite API'siyle uğraşmasın.
@Service
public class IgniteService {

    private final IgniteCache<Long, HomeLiveState> homeStateCache;
    private final IgniteCache<Long, Integer> breachCounterCache;

    public IgniteService(Ignite ignite) {
        this.homeStateCache = ignite.getOrCreateCache("homeLiveState");
        this.breachCounterCache = ignite.getOrCreateCache("applianceBreachCounter");
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
}