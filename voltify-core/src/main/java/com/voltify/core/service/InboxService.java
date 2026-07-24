package com.voltify.core.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.voltify.core.dto.InboxMessageResponse;
import com.voltify.core.entity.AiRecommendation;
import com.voltify.core.entity.User;
import com.voltify.core.repository.AiRecommendationRepository;

// Gelen kutusu: giriş yapmış kullanıcının evlerinde tetiklenen penalty/anomali
// uyarılarını (e-posta olarak gönderilen AI tavsiyeleri) listeler.
@Service
public class InboxService {

    private final AiRecommendationRepository aiRecommendationRepository;

    public InboxService(AiRecommendationRepository aiRecommendationRepository) {
        this.aiRecommendationRepository = aiRecommendationRepository;
    }

    public List<InboxMessageResponse> getInbox() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return aiRecommendationRepository.findByOwnerOrderByCreatedAtDesc(currentUser).stream()
                .map(this::toMessage)
                .collect(Collectors.toList());
    }

    private InboxMessageResponse toMessage(AiRecommendation rec) {
        InboxMessageResponse msg = new InboxMessageResponse();
        msg.setId(rec.getId());
        msg.setCategory(rec.getTriggerContext());
        msg.setHomeName(rec.getHome() != null ? rec.getHome().getName() : "");
        msg.setBody(rec.getGeneratedText());
        msg.setCreatedAt(rec.getCreatedAt());
        msg.setEmailSent(Boolean.TRUE.equals(rec.getEmailSent()));
        return msg;
    }
}
