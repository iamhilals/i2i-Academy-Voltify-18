package com.voltify.core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

// Basit SMTP mail sender. Hata durumunda log'lar ve uygulamayı bloke etmez.
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendAlertEmail(String toAddress, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toAddress);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("📧 Email gönderildi -> " + toAddress);
            return true;
        } catch (Exception e) {
            System.err.println("Email gönderilemedi (" + toAddress + "): " + e.getMessage());
            return false;
        }
    }
}