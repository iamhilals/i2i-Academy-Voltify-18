package com.voltify.core.config;

import java.util.ArrayList;

import org.apache.ignite.Ignite;
import org.apache.ignite.Ignition;
import org.apache.ignite.configuration.CacheConfiguration;
import org.apache.ignite.configuration.IgniteConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PreDestroy;
import com.voltify.core.ignite.ApplianceReading;
import com.voltify.core.ignite.HomeLiveState;

@Configuration
public class IgniteConfig {

    private Ignite ignite;

    @Bean
    public Ignite ignite() {
        IgniteConfiguration cfg = new IgniteConfiguration();
        cfg.setIgniteInstanceName("voltify-ignite-client");
        cfg.setClientMode(false);
        cfg.setPeerClassLoadingEnabled(true);
    
        // Cache 1: Home canlı state
        CacheConfiguration<Long, HomeLiveState> homeStateCacheCfg = new CacheConfiguration<>("homeLiveState");
        homeStateCacheCfg.setIndexedTypes(Long.class, HomeLiveState.class);
    
        // Cache 2: Cihaz breach counter
        CacheConfiguration<Long, Integer> breachCounterCacheCfg = new CacheConfiguration<>("applianceBreachCounter");

        // Cache 3: Cihaz anlık watt değeri (canlı UI için)
        CacheConfiguration<Long, Double> applianceWattCacheCfg = new CacheConfiguration<>("applianceLiveWatt");

        // Cache 4: Cihaz geçmiş tamponu (dönen 24 saatlik pencere - grafik geçmişi için)
        CacheConfiguration<Long, ArrayList<ApplianceReading>> applianceHistoryCacheCfg =
                new CacheConfiguration<>("applianceHistory");

        // Cache 5: Cihaz kümülatif watt toplamı (toplam enerji/maliyet için)
        CacheConfiguration<Long, Double> applianceCumulativeWattCacheCfg =
                new CacheConfiguration<>("applianceCumulativeWatt");

        cfg.setCacheConfiguration(homeStateCacheCfg, breachCounterCacheCfg,
                applianceWattCacheCfg, applianceHistoryCacheCfg, applianceCumulativeWattCacheCfg);
    
        this.ignite = Ignition.start(cfg);
        return this.ignite;
    }

    @PreDestroy
    public void shutdown() {
        if (ignite != null) {
            ignite.close();
        }
    }
}