package com.voltify.core.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Tüm controller'lar için merkezi hata yönetimi.
// Ham exception ve stack trace'ler istemciye ASLA sızmaz; her zaman temiz JSON döner.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // AuthException fırlatıldığında (örn: "email zaten kayıtlı") burası devreye girer
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<Map<String, String>> handleAuthException(AuthException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // Kullanıcı, kendisine ait olmayan bir kaynağa erişmeye çalıştığında
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, String>> handleForbiddenException(ForbiddenException ex) {
        return error(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    // İstenen kaynak (ev, cihaz vb.) bulunamadığında 404 döner
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // @NotBlank, @Email, @Size gibi validasyon kuralları ihlal edildiğinde burası devreye girer
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fieldError ->
            errors.put(fieldError.getField(), fieldError.getDefaultMessage())
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    // Son güvenlik ağı: beklenmeyen her hata için temiz mesaj (stack trace sızmaz)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        System.err.println("İşlenmeyen hata: " + ex.getClass().getSimpleName() + " - " + ex.getMessage());
        return error(HttpStatus.INTERNAL_SERVER_ERROR,
                "Beklenmeyen bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.");
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
