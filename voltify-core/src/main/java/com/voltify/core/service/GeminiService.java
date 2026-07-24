package com.voltify.core.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

// Gemini LLM ile iletişim - Türkçe kişiselleştirilmiş tavsiye üretir.
// Hata durumunda temiz fallback döner (uygulamayı bloke etmez).
@Service
public class GeminiService {

    private static final String FALLBACK_MESSAGE =
            "Enerji tüketiminiz yüksek görünüyor. Tavsiye üretilirken bir sorun oluştu, " +
            "cihazlarınızı kontrol etmenizi ve gereksiz kullanımı azaltmanızı öneririz.";

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Volty AI Chatbot için gelişmiş Prompt Engineering ile özelleştirilmiş yanıt üretir.
    public String askVolty(String userMessage) {
        String systemPrompt = "[KİMLİK & ROL]\n"
                + "Sen Voltify IoT Enerji Yönetim Platformu'nun uzman akıllı enerji danışmanı ve asistanı \"Volty ⚡\"sin. "
                + "Amacın kullanıcıların evlerindeki enerji tüketimini, cihaz verimliliğini, bütçe yönetimini ve standby (bekleme modu) güç kaçaklarını analiz ederek nokta atışı, mantıklı, bilimsel ve uygulaması kolay tavsiyeler vermektir.\n\n"
                + "[YANIT YÖNERGELERİ]\n"
                + "1. **Nokta Atışı & Somut Veriler:** Yanıtlarında genel geçer öğütler yerine somut rakamlar, sıcaklık dereceleri (°C), zaman aralıkları (ör. 22:00-06:00 ucuz tarife), Watt/kWh değerleri ve tahmini % tasarruf oranları ver.\n"
                + "2. **Net ve Açıklayıcı Yapı:**\n"
                + "   - 🔍 **Teşhis:** Sorunun veya durumun kök nedenini 1 cümle ile açıkla.\n"
                + "   - 💡 **Nokta Atışı Adımlar:** 2-3 adet pratik, net ve uygulanabilir çözüm adımı ver.\n"
                + "   - 💰 **Tahmini Kazanç:** Aylık/yıllık bütçe tasarrufu veya kWh kazancını vurgula.\n"
                + "3. **Üslup:** Enerjik, dost canlısı, son derece zeki, Türkçe ve teşvik edici ol. Gereksiz laf kalabalığı yapma, doyurucu ve net ol.\n\n"
                + "[KULLANICI MESAJI]: " + userMessage;
        return generateAdvice(systemPrompt);
    }

    // Verilen prompt'u Gemini'ye yollar, Türkçe tavsiye metni döndürür.
    // Hata durumunda fallback text döner.
    public String generateAdvice(String prompt) {
        try {
            String urlWithKey = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Gemini API request format:
            // { "contents": [{ "parts": [{ "text": "..." }] }] }
            Map<String, Object> body = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            @SuppressWarnings({"rawtypes", "unchecked"})
            ResponseEntity<Map<String, Object>> response =
                    (ResponseEntity<Map<String, Object>>) (ResponseEntity) restTemplate.postForEntity(urlWithKey, request, Map.class);

            // DEBUG: Gemini'nin dönen JSON'unu görelim
            System.out.println("🔍 Gemini raw response: " + response.getBody());

            return extractTextFromResponse(response.getBody());

        } catch (RestClientException e) {
            System.err.println("Gemini API çağrısı başarısız: " + e.getMessage());
            return FALLBACK_MESSAGE;
        } catch (Exception e) {
            System.err.println("Gemini yanıtı işlenemedi: " + e.getMessage());
            return FALLBACK_MESSAGE;
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> responseBody) {
        if (responseBody == null) return FALLBACK_MESSAGE;

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
        if (candidates == null || candidates.isEmpty()) return FALLBACK_MESSAGE;

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) return FALLBACK_MESSAGE;

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return FALLBACK_MESSAGE;

        Object text = parts.get(0).get("text");
        return text != null ? text.toString() : FALLBACK_MESSAGE;
    }
}