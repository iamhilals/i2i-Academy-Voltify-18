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
        double safeLimit = appliance.getSafePowerLimit() != null ? appliance.getSafePowerLimit() : 1500.0;

        // Canlı UI için cihazın son watt değerini Ignite'a yaz (sub-ms okuma)
        igniteService.putApplianceWatt(applianceId, watt);
        // Cihaz geçmiş tamponuna kaydet (grafiğin 1s/6s/24s geçmişi için, throttle'lı)
        igniteService.recordApplianceReading(applianceId, watt);
        // Kümülatif toplam (toplam kWh/maliyet için)
        igniteService.addApplianceCumulativeWatt(applianceId, watt);

        if (watt > safeLimit) {
            int newCount = igniteService.incrementBreachCounter(applianceId);
            // Sadece sayaç tam olarak eşiğe ulaştığında tetikle. Sonraki ihlaller
            // sayacı 4, 5, 6... yapar ve bir daha eşiğe eşit olmaz; cihaz normale
            // dönüp sayaç sıfırlanana kadar tekrar alarm üretilmez.
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