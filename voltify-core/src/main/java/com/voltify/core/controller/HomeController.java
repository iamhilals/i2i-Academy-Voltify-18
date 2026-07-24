package com.voltify.core.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.voltify.core.dto.HomeStatusResponse;
import com.voltify.core.dto.HomeUpdateRequest;
import com.voltify.core.entity.Appliance;
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
    public ResponseEntity<HomeStatusResponse> getHomeStatus(@PathVariable Long homeId) {
        return ResponseEntity.ok(homeService.getHomeStatus(homeId));
    }

    @GetMapping("/history/{homeId}")
    public ResponseEntity<Page<ConsumptionSnapshot>> getHomeHistory(
            @PathVariable Long homeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(homeService.getHomeHistoryPage(homeId, page, size, from, to));
    }

    @PutMapping("/{homeId}")
    public ResponseEntity<Home> updateHome(@PathVariable Long homeId, @RequestBody HomeUpdateRequest request) {
        return ResponseEntity.ok(homeService.updateHome(homeId, request));
    }

    @DeleteMapping("/{homeId}")
    public ResponseEntity<Void> deleteHome(@PathVariable Long homeId) {
        homeService.deleteHome(homeId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{homeId}/appliances")
    public ResponseEntity<Home> addAppliance(@PathVariable Long homeId, @RequestBody Appliance appliance) {
        return ResponseEntity.ok(homeService.addAppliance(homeId, appliance));
    }

    @DeleteMapping("/{homeId}/appliances/{applianceId}")
    public ResponseEntity<Void> deleteAppliance(@PathVariable Long homeId, @PathVariable Long applianceId) {
        homeService.deleteAppliance(homeId, applianceId);
        return ResponseEntity.noContent().build();
    }
}