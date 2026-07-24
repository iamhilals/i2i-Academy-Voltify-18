package com.voltify.core.telemetry;

import java.util.Optional;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltify.core.entity.Appliance;
import com.voltify.core.entity.EventLog;
import com.voltify.core.repository.ApplianceRepository;
import com.voltify.core.repository.EventLogRepository;
import com.voltify.core.service.AlertNotificationService;
import com.voltify.core.service.EcoPetService;
import com.voltify.core.service.IgniteService;
import com.voltify.core.service.TariffEngineService;

@Service
public class TelemetryConsumerService {

    private static final int ANOMALY_THRESHOLD = 3; // 3 ardışık cycle safe limit aşımı = anomali

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final TariffEngineService tariffEngineService;
    private final IgniteService igniteService;
    private final ApplianceRepository applianceRepository;
    private final EventLogRepository eventLogRepository;
    private final AlertNotificationService alertNotificationService;
    private final EcoPetService ecoPetService;

    public TelemetryConsumerService(TariffEngineService tariffEngineService,
                                     IgniteService igniteService,
                                     ApplianceRepository applianceRepository,
                                     EventLogRepository eventLogRepository,
                                     AlertNotificationService alertNotificationService,
                                     EcoPetService ecoPetService) {
        this.tariffEngineService = tariffEngineService;
        this.igniteService = igniteService;
        this.applianceRepository = applianceRepository;
        this.eventLogRepository = eventLogRepository;
        this.alertNotificationService = alertNotificationService;
        this.ecoPetService = ecoPetService;
    }

    @KafkaListener(topics = "telemetry", groupId = "voltify-telemetry-group")
    public void listenTelemetry(String message) {
        try {
            TelemetryEvent event = objectMapper.readValue(message, TelemetryEvent.class);
            System.out.println("📡 Telemetry: home=" + event.getHomeId()
                    + ", appliance=" + event.getApplianceId()
                    + ", watt=" + event.getWatt());

            // 1) Kota + billing update (TariffEngine)
            tariffEngineService.processTelemetry(event.getHomeId(), event.getWatt());

            // 2) Consecutive breach check (cihaz seviyesi)
            checkApplianceAnomaly(event.getApplianceId(), event.getWatt());

        } catch (Exception e) {
            System.err.println("Telemetry mesajı işlenemedi: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void checkApplianceAnomaly(Long applianceId, Double watt) {
        Optional<Appliance> applOpt = applianceRepository.findById(applianceId);
        if (applOpt.isEmpty()) return;

        Appliance appliance = applOpt.get();
        double safeLimit = appliance.getSafePowerLimit();

        if (watt > safeLimit) {
            int newCount = igniteService.incrementBreachCounter(applianceId);
            if (newCount == ANOMALY_THRESHOLD) {
                // Anomali tespit edildi - EventLog kaydet
                EventLog log = new EventLog();
                log.setHome(appliance.getHome());
                log.setEventType(EventLog.EventType.ANOMALY_DETECTED);
                log.setMetadata(String.format(
                        "{\"applianceId\":%d,\"applianceName\":\"%s\",\"watt\":%.2f,\"safeLimit\":%.2f}",
                        applianceId, appliance.getName(), watt, safeLimit));
                eventLogRepository.save(log);
                System.out.println("🔥 ANOMALY: " + appliance.getName()
                        + " (id=" + applianceId + ") - 3 consecutive breaches");
                alertNotificationService.notifyApplianceAnomaly(appliance.getHome(), appliance.getName(), watt, safeLimit);

                // Eco-Pet Anomali Cezası Uygulama
                if (appliance.getHome().getOwner() != null) {
                    ecoPetService.applyAnomalyPenalty(appliance.getHome().getOwner().getId(), 10);
                }

                // Sayacı çok büyük bir sayıya çıkar ki tekrar 3'e ulaşamasın.
                // Cihaz normale döner de sayaç sıfırlanırsa (else bloğunda), tekrar 3'e ulaşabilir - bu zaten yeni bir olaydır.
                for (int i = 0; i < 1000; i++) {
                    igniteService.incrementBreachCounter(applianceId);
                }
            }
        } else {
            // Normal aralığa döndü - sayaç sıfırla (varsa)
            if (igniteService.getBreachCounter(applianceId) > 0) {
                igniteService.resetBreachCounter(applianceId);

                EventLog log = new EventLog();
                log.setHome(appliance.getHome());
                log.setEventType(EventLog.EventType.ANOMALY_RESOLVED);
                log.setMetadata(String.format(
                        "{\"applianceId\":%d,\"applianceName\":\"%s\"}",
                        applianceId, appliance.getName()));
                eventLogRepository.save(log);
            }
        }
    }
}