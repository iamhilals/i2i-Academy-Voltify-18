package com.voltify.core.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.voltify.core.entity.EcoPet;
import com.voltify.core.entity.User;
import com.voltify.core.repository.EcoPetRepository;
import com.voltify.core.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final EcoPetRepository ecoPetRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository, EcoPetRepository ecoPetRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.ecoPetRepository = ecoPetRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        // Developer / Demo Bypass Modu: 403 hatalarını önlemek için
        if ("demo-jwt-token".equals(token)) {
            User user = userRepository.findByUsername("volkan").orElseGet(() -> {
                User newUser = new User();
                newUser.setUsername("volkan");
                newUser.setFirstName("Volkan");
                newUser.setLastName("Yüksel");
                newUser.setEmail("volkan@voltify.com");
                newUser.setPhoneNumber("05555555555");
                newUser.setPassword("password");
                return userRepository.save(newUser);
            });

            // Kullanıcının EcoPet'i yoksa oluştur
            if (ecoPetRepository.findByUser(user).isEmpty()) {
                EcoPet pet = new EcoPet();
                pet.setUser(user);
                pet.setName("VoltBot");
                pet.setHealthScore(100);
                pet.setLevel(1);
                pet.setExperience(0);
                pet.setFoodCount(5);
                ecoPetRepository.save(pet);
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
            return;
        }

        if (jwtUtil.isTokenValid(token)) {
            String email = jwtUtil.extractEmail(token);

            User user = userRepository.findByEmail(email).orElse(null);

            if (user != null) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, null, java.util.Collections.emptyList());

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}