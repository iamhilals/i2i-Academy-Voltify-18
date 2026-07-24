package com.voltify.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.voltify.core.entity.EcoPet;
import com.voltify.core.entity.User;
import com.voltify.core.service.EcoPetService;

@RestController
@RequestMapping("/api/eco-pet")
public class EcoPetController {

    private final EcoPetService ecoPetService;

    public EcoPetController(EcoPetService ecoPetService) {
        this.ecoPetService = ecoPetService;
    }

    @GetMapping
    public ResponseEntity<EcoPet> getPet() {
        User currentUser = getCurrentUser();
        EcoPet pet = ecoPetService.getOrCreatePet(currentUser);
        return ResponseEntity.ok(pet);
    }

    @PostMapping("/feed")
    public ResponseEntity<EcoPet> feedPet() {
        User currentUser = getCurrentUser();
        EcoPet pet = ecoPetService.feedPet(currentUser.getId());
        return ResponseEntity.ok(pet);
    }

    @PostMapping("/rename")
    public ResponseEntity<EcoPet> renamePet(@RequestParam String name) {
        User currentUser = getCurrentUser();
        EcoPet pet = ecoPetService.renamePet(currentUser.getId(), name);
        return ResponseEntity.ok(pet);
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
