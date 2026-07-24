package com.voltify.core.exception;

// Kaynak (ev, cihaz vb.) bulunamadığında fırlatılır. GlobalExceptionHandler bunu 404'e çevirir.
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
