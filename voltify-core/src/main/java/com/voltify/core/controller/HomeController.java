package com.voltify.core.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.voltify.core.entity.ConsumptionSnapshot;
import com.voltify.core.entity.Home;
import com.voltify.core.service.HomeService;

@RestController
@RequestMapping("/api/homes")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @PostMapping("/register")
    public ResponseEntity<Home> registerHome(@RequestBody Home home) {
        Home savedHome = homeService.registerHome(home);
        return ResponseEntity.ok(savedHome);
    }

    @GetMapping("/my-homes")
    public ResponseEntity<List<Home>> getMyHomes() {
        List<Home> homes = homeService.getMyHomes();
        return ResponseEntity.ok(homes);
    }

    @GetMapping("/status/{homeId}")
    public ResponseEntity<Home> getHomeStatus(@PathVariable Long homeId) {
        return ResponseEntity.ok(homeService.getHomeStatus(homeId));
    }

    @GetMapping("/history/{homeId}")
    public ResponseEntity<List<ConsumptionSnapshot>> getHomeHistory(@PathVariable Long homeId) {
        return ResponseEntity.ok(homeService.getHomeHistory(homeId));
    }
}