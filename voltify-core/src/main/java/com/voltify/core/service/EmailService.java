package com.voltify.core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

// SMTP mail sender. Gemini metnindeki markdown'ı HTML'e çevirip HTML + düz-metin
// (multipart) gönderir; böylece Gmail'de kalın yazı ve listeler düzgün görünür,
// ham ** / * yıldızları görünmez. Hata durumunda log'lar ve uygulamayı bloke etmez.
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
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toAddress);
            helper.setSubject(subject);

            String plain = stripMarkdown(body);
            String html = "<div style=\"font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;line-height:1.6;\">"
                    + markdownToHtml(body) + "</div>";
            helper.setText(plain, html); // (düz-metin, html) — istemci hangisini destekliyorsa

            mailSender.send(message);
            System.out.println("📧 Email gönderildi -> " + toAddress);
            return true;
        } catch (Exception e) {
            System.err.println("Email gönderilemedi (" + toAddress + "): " + e.getMessage());
            return false;
        }
    }

    // --- Markdown yardımcıları ---

    // HTML dostu düz-metin: yıldızları temizler, madde işaretlerini • yapar
    private static String stripMarkdown(String md) {
        if (md == null) return "";
        return md.replaceAll("\\*\\*([^*]+)\\*\\*", "$1")   // **kalın** -> kalın
                 .replaceAll("(?m)^\\s*[*-]\\s+", "• ")       // * madde -> • madde
                 .replaceAll("(?m)^\\s*#{1,6}\\s+", "");       // başlıklar
    }

    // Basit markdown -> HTML: **kalın**, madde (*/-) ve numaralı (1.) listeler, paragraflar
    private static String markdownToHtml(String md) {
        if (md == null) return "";
        String[] lines = md.split("\n");
        StringBuilder html = new StringBuilder();
        String listType = null; // "ul" | "ol"

        for (String raw : lines) {
            String line = escapeHtml(raw.trim());
            if (line.isEmpty()) {
                listType = closeList(html, listType);
                continue;
            }
            if (line.matches("^\\d+\\.\\s+.*")) {
                if (!"ol".equals(listType)) { listType = closeList(html, listType); html.append("<ol>"); listType = "ol"; }
                html.append("<li>").append(inline(line.replaceFirst("^\\d+\\.\\s+", ""))).append("</li>");
            } else if (line.matches("^[*-]\\s+.*")) {
                if (!"ul".equals(listType)) { listType = closeList(html, listType); html.append("<ul>"); listType = "ul"; }
                html.append("<li>").append(inline(line.replaceFirst("^[*-]\\s+", ""))).append("</li>");
            } else if (line.matches("^#{1,6}\\s+.*")) {
                listType = closeList(html, listType);
                html.append("<h3 style=\"margin:12px 0 4px;\">").append(inline(line.replaceFirst("^#{1,6}\\s+", ""))).append("</h3>");
            } else {
                listType = closeList(html, listType);
                html.append("<p style=\"margin:8px 0;\">").append(inline(line)).append("</p>");
            }
        }
        closeList(html, listType);
        return html.toString();
    }

    private static String inline(String s) {
        return s.replaceAll("\\*\\*([^*]+)\\*\\*", "<strong>$1</strong>");
    }

    private static String escapeHtml(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private static String closeList(StringBuilder html, String listType) {
        if ("ul".equals(listType)) html.append("</ul>");
        else if ("ol".equals(listType)) html.append("</ol>");
        return null;
    }
}
