package com.voltify.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.voltify.core.dto.ChatRequest;
import com.voltify.core.dto.ChatResponse;
import com.voltify.core.service.GeminiService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chatWithVolty(@RequestBody ChatRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Lütfen geçerli bir soru yazın.", System.currentTimeMillis()));
        }

        String reply = geminiService.askVolty(request.getMessage().trim());
        ChatResponse response = new ChatResponse(reply, System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
