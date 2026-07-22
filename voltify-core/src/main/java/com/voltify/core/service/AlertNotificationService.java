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

        return String.format(
                "Sen bir enerji tasarrufu uzmanısın. Türkçe, kısa ve nazik bir uyarı mesajı yaz. " +
                "Ev bilgileri: '%s' isimli ev, aylık güç kotası %.0f Watt, aylık bütçe kotası %.2f TL. " +
                "Şu ana kadar %.0f Watt tüketildi ve %.2f TL fatura biriktirdi. " +
                "%s uyarısı tetiklendi. Kullanıcıya nazikçe bilgi ver ve 3-4 somut tasarruf tavsiyesi sun. " +
                "En fazla 150 kelime kullan.",
                home.getName(), home.getPowerQuotaWatt(), home.getBudgetQuotaTry(),
                watt, balance,
                breachType.equals("BREACH_80") ? "%80 kota" : "%100 kota (ceza tarifesi aktif)"
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