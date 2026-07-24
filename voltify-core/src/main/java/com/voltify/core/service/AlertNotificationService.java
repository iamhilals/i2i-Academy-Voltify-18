package com.voltify.core.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voltify.core.entity.AiRecommendation;
import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.Home;
import com.voltify.core.repository.AiRecommendationRepository;
import com.voltify.core.repository.BillingLedgerRepository;

// Bir breach/anomaly olayında Gemini'den tavsiye al, PostgreSQL'e kaydet, email gönder.
@Service
public class AlertNotificationService {

    private final GeminiService geminiService;
    private final EmailService emailService;
    private final AiRecommendationRepository aiRecommendationRepository;
    private final BillingLedgerRepository billingLedgerRepository;

    public AlertNotificationService(GeminiService geminiService,
                                     EmailService emailService,
                                     AiRecommendationRepository aiRecommendationRepository,
                                     BillingLedgerRepository billingLedgerRepository) {
        this.geminiService = geminiService;
        this.emailService = emailService;
        this.aiRecommendationRepository = aiRecommendationRepository;
        this.billingLedgerRepository = billingLedgerRepository;
    }

    // Kota breach uyarısı (BREACH_80 veya BREACH_100)
    @Transactional
    public void notifyQuotaBreach(Home home, String breachType) {
        BillingLedger ledger = billingLedgerRepository.findByHomeId(home.getId()).orElse(null);
        String prompt = buildQuotaPrompt(home, ledger, breachType);
        String advice = geminiService.generateAdvice(prompt);

        persistRecommendation(home, breachType, advice);

        String subject = "Voltify Uyarı: Elektrik Kotası Aşımı (" + breachType + ")";
        emailService.sendAlertEmail(home.getContactEmail(), subject, advice);
    }

    // Cihaz anomali uyarısı (3 ardışık safe limit aşımı)
    @Transactional
    public void notifyApplianceAnomaly(Home home, String applianceName, Double currentWatt, Double safeLimit) {
        String prompt = buildAnomalyPrompt(home, applianceName, currentWatt, safeLimit);
        String advice = geminiService.generateAdvice(prompt);

        persistRecommendation(home, "ANOMALY_DETECTED", advice);

        String subject = "Voltify Uyarı: " + applianceName + " Anormal Tüketim";
        emailService.sendAlertEmail(home.getContactEmail(), subject, advice);
    }

    private void persistRecommendation(Home home, String triggerContext, String text) {
        AiRecommendation rec = new AiRecommendation();
        rec.setHome(home);
        rec.setTriggerContext(triggerContext);
        rec.setGeneratedText(text);
        rec.setEmailSent(true); // Basitleştirme: send çağrısından bağımsız true set ediyoruz
        rec.setCreatedAt(LocalDateTime.now());
        aiRecommendationRepository.save(rec);
    }

    private String buildQuotaPrompt(Home home, BillingLedger ledger, String breachType) {
        double watt = ledger != null ? ledger.getAccumulatedWatt() : 0.0;
        double balance = ledger != null ? ledger.getCurrentBalance() : 0.0;

        String registeredDevicesStr = (home.getAppliances() != null && !home.getAppliances().isEmpty())
                ? home.getAppliances().stream().map(a -> a.getName()).reduce((a, b) -> a + ", " + b).orElse("Henüz tanımlı cihaz yok")
                : "Henüz kayıtlı cihaz yok";

        return String.format(
                "Sen bir enerji tasarrufu uzmanısın. Türkçe, kısa ve son derece nazik bir e-posta uyarısı yaz. " +
                "Ev bilgileri: '%s' isimli ev, aylık güç kotası %.0f Watt, aylık bütçe kotası %.2f TL. " +
                "Şu ana kadar %.0f Watt tüketildi ve %.2f TL fatura biriktirdi. " +
                "Evde kayıtlı aktif cihazlar şunlardır: [%s]. " +
                "%s uyarısı tetiklendi. " +
                "ÖNEMLİ KURAL: Yalnızca yukarıdaki listede kayıtlı olan cihazlar üzerinden tasarruf önerileri sun. " +
                "Evde bulunmayan veya yukarıdaki listede yer almayan cihazlardan (Örn: Klima, Fırın vs. listede yoksa) ASLA BAHSETME! " +
                "Kullanıcıya nazikçe bilgi ver ve listedeki cihazlar üzerinden 2-3 pratik tasarruf önerisi sun. " +
                "En fazla 120 kelime kullan.",
                home.getName(), home.getPowerQuotaWatt(), home.getBudgetQuotaTry(),
                watt, balance, registeredDevicesStr,
                breachType.equals("BREACH_80") ? "%80 bütçe kotası" : "%100 bütçe kotası (ceza tarifesi aktif)"
        );
    }

    private String buildAnomalyPrompt(Home home, String applianceName, Double watt, Double safeLimit) {
        return String.format(
                "Sen bir enerji tasarrufu uzmanısın. Türkçe, kısa ve nazik bir uyarı mesajı yaz. " +
                "'%s' isimli evdeki '%s' cihazı 3 ardışık ölçümde güvenli limitini aştı " +
                "(güvenli limit: %.0f Watt, son ölçüm: %.0f Watt). Bu cihazda bir anomali olabilir. " +
                "Kullanıcıya nazikçe bilgi ver, cihazı kontrol etmesini öner ve 2-3 pratik öneri sun. " +
                "En fazla 150 kelime kullan.",
                home.getName(), applianceName, safeLimit, watt
        );
    }
}