package com.voltify.core.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.voltify.core.dto.ChatRequest;
import com.voltify.core.dto.ChatResponse;
import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.Home;
import com.voltify.core.entity.User;
import com.voltify.core.repository.BillingLedgerRepository;
import com.voltify.core.repository.HomeRepository;
import com.voltify.core.service.GeminiService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;
    private final HomeRepository homeRepository;
    private final BillingLedgerRepository billingLedgerRepository;

    public AiController(GeminiService geminiService, 
                        HomeRepository homeRepository, 
                        BillingLedgerRepository billingLedgerRepository) {
        this.geminiService = geminiService;
        this.homeRepository = homeRepository;
        this.billingLedgerRepository = billingLedgerRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chatWithVolty(@RequestBody ChatRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Lütfen geçerli bir soru yazın.", System.currentTimeMillis()));
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            // Security fallback (yetkilendirme yoksa veya principal tip uyuşmuyorsa standart cevap ver)
            String reply = geminiService.askVolty(request.getMessage().trim());
            return ResponseEntity.ok(new ChatResponse(reply, System.currentTimeMillis()));
        }

        User currentUser = (User) auth.getPrincipal();
        List<Home> homes = homeRepository.findByOwner(currentUser);

        // Volty için bağlam (context) oluşturma
        StringBuilder context = new StringBuilder();
        context.append("[SİSTEM & BAĞLAM BİLGİLERİ]\n");
        context.append("Kullanıcı: ").append(currentUser.getFirstName()).append(" ").append(currentUser.getLastName()).append("\n");
        context.append("E-posta: ").append(currentUser.getEmail()).append("\n\n");
        
        if (homes.isEmpty()) {
            context.append("Kullanıcının henüz kayıtlı bir evi bulunmuyor.\n");
        } else {
            context.append("Kullanıcının Ev ve Fatura Bilgileri:\n");
            for (Home home : homes) {
                context.append("- ").append(home.getName()).append(":\n");
                context.append("  * Güç Kotası: ").append(home.getPowerQuotaWatt()).append(" Watt\n");
                context.append("  * Bütçe Kotası: ").append(home.getBudgetQuotaTry()).append(" TL\n");
                context.append("  * Oda Sayısı: ").append(home.getRoomLayout()).append(", Alan: ").append(home.getSquareMeters()).append(" m²\n");
                context.append("  * Standart Tarife: ").append(home.getBaseRate()).append(" TL/kWh, Cezalı Tarife: ").append(home.getPenaltyRate()).append(" TL/kWh\n");
                
                BillingLedger ledger = billingLedgerRepository.findByHome(home).orElse(null);
                if (ledger != null) {
                    double accumulatedKwh = ledger.getAccumulatedWatt() / 1000.0;
                    context.append("  * Güncel Fatura Tutarı: ").append(String.format("%.2f", ledger.getCurrentBalance())).append(" TL\n");
                    context.append("  * Toplam Biriken Tüketim: ").append(String.format("%.2f", ledger.getAccumulatedWatt())).append(" Watt (").append(String.format("%.3f", accumulatedKwh)).append(" kWh)\n");
                    context.append("  * Ceza Durumu: ").append(ledger.getIsPenaltyActive() ? "AKTİF (Kota aşımı nedeniyle cezalı tarife devrede!)" : "PASİF (Normal tarife devrede)").append("\n");
                }
                context.append("\n");
            }
        }

        // Volty AI asistanının karakterini tanımlayan sistem promptu ile bağlamı birleştiriyoruz
        String fullPrompt = "[ROL & KİMLİK]\n"
                + "Sen Voltify akıllı enerji platformunun uzman asistanı \"Volty ⚡\"sin. "
                + "Yukarıdaki [SİSTEM & BAĞLAM BİLGİLERİ] verilerini kullanarak kullanıcının sorusuna net, sayısal veriler barındıran ve arkadaşça bir dille Türkçe yanıt ver.\n\n"
                + "[ÖNEMLİ YÖNERGE]\n"
                + "1. Yanıtlarını son derece kısa, öz ve net tut. Uzun paragraflar yazma. En fazla 2-3 cümlede doğrudan sorulan sorunun cevabını ver.\n"
                + "2. YANITLARINDA ASLA markdown biçimlendirmesi (kalın yazı için ** veya liste için * gibi yıldız işaretleri) KULLANMA. Tamamen düz metin (plain text) olarak yanıt yaz.\n\n"
                + context.toString()
                + "\n[KULLANICI SORUSU]: " + request.getMessage().trim();

        String reply = geminiService.generateAdvice(fullPrompt);
        ChatResponse response = new ChatResponse(reply, System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
