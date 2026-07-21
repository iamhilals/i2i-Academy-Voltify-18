package com.voltify.core.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    // Kullanıcı bunun içine email VEYA username yazabilir
    // Backward compatibility için 'email' alanı da destekleniyor
    private String identifier;

    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // Yardımcı: email veya identifier alanından hangisi doluysa onu döndür
    public String resolveIdentifier() {
        if (identifier != null && !identifier.isBlank()) {
            return identifier;
        }
        return email;
    }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}