package com.voltify.core.config;

import org.apache.ignite.Ignite;
import org.apache.ignite.Ignition;
import org.apache.ignite.configuration.CacheConfiguration;
import org.apache.ignite.configuration.IgniteConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PreDestroy;
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
    
        cfg.setCacheConfiguration(homeStateCacheCfg, breachCounterCacheCfg);
    
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