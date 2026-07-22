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