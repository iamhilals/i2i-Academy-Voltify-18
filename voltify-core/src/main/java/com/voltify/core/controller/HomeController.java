package com.voltify.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.voltify.core.entity.Home;
import com.voltify.core.service.HomeService;

@RestController
@RequestMapping("/api/homes")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    // Dışarıdan POST isteği alacak olan endpoint'imiz[cite: 1]
    @PostMapping("/register")
    public ResponseEntity<Home> registerHome(@RequestBody Home home) {
        Home savedHome = homeService.registerHome(home);
        return ResponseEntity.ok(savedHome);
    }
}