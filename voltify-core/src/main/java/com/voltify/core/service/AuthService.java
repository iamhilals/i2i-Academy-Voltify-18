package com.voltify.core.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.voltify.core.dto.AuthResponse;
import com.voltify.core.dto.LoginRequest;
import com.voltify.core.dto.RegisterRequest;
import com.voltify.core.entity.User;
import com.voltify.core.exception.AuthException;
import com.voltify.core.repository.UserRepository;
import com.voltify.core.security.JwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {

        // 1. Email zaten kayıtlı mı kontrol et
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Bu email adresi zaten kayıtlı");
        }

        // 2. Kullanıcı adı zaten alınmış mı kontrol et
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Bu kullanıcı adı zaten alınmış");
        }

        // 3. Yeni User nesnesi oluştur
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());

        // 4. Şifreyi ASLA olduğu gibi kaydetme, hashle
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // 5. Veritabanına kaydet
        User savedUser = userRepository.save(user);

        // 6. Token üret ve cevap olarak dön
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return new AuthResponse(token, savedUser.getEmail(), savedUser.getUsername());
    }

    public AuthResponse login(LoginRequest request) {

        // 1. Kullanıcıyı email ile bul, yoksa hata fırlat
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Email veya şifre hatalı"));

        // 2. Girilen şifre ile veritabanındaki hash'i karşılaştır
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Email veya şifre hatalı");
        }

        // 3. Doğruysa token üret ve dön
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getUsername());
    }
}