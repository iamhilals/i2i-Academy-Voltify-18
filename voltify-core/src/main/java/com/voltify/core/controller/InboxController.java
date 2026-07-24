package com.voltify.core.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.voltify.core.dto.InboxMessageResponse;
import com.voltify.core.service.InboxService;

@RestController
@RequestMapping("/api/inbox")
public class InboxController {

    private final InboxService inboxService;

    public InboxController(InboxService inboxService) {
        this.inboxService = inboxService;
    }

    // Giriş yapmış kullanıcının penalty/anomali uyarı geçmişi (gelen kutusu)
    @GetMapping
    public ResponseEntity<List<InboxMessageResponse>> getInbox() {
        return ResponseEntity.ok(inboxService.getInbox());
    }
}
