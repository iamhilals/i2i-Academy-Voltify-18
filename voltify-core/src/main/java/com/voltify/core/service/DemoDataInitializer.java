package com.voltify.core.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.voltify.core.entity.Appliance;
import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.Home;
import com.voltify.core.entity.User;
import com.voltify.core.repository.BillingLedgerRepository;
import com.voltify.core.repository.HomeRepository;
import com.voltify.core.repository.UserRepository;

// Değerlendiriciler için tek tık demo giriş: başlangıçta 'admin' / 'admin123'
// hesabını, örnek bir ev ve cihazlarla birlikte oluşturur (yoksa). Böylece login
// ekranındaki "Admin Girişi" butonu doğrudan çalışan bir panele düşürür.
@Component
@Order(0)
public class DemoDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final HomeRepository homeRepository;
    private final BillingLedgerRepository billingLedgerRepository;
    private final EcoPetService ecoPetService;
    private final PasswordEncoder passwordEncoder;

    public DemoDataInitializer(UserRepository userRepository,
                               HomeRepository homeRepository,
                               BillingLedgerRepository billingLedgerRepository,
                               EcoPetService ecoPetService,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.homeRepository = homeRepository;
        this.billingLedgerRepository = billingLedgerRepository;
        this.ecoPetService = ecoPetService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByUsername("admin")) {
            return; // Demo hesap zaten var
        }

        User admin = new User();
        admin.setFirstName("Demo");
        admin.setLastName("Admin");
        admin.setUsername("admin");
        admin.setEmail("admin@voltify.com");
        admin.setPhoneNumber("05000000000");
        admin.setPassword(passwordEncoder.encode("admin123"));
        User saved = userRepository.save(admin);
        ecoPetService.getOrCreatePet(saved);

        Home home = new Home();
        home.setOwner(saved);
        home.setName("Demo Ev");
        home.setContactEmail("admin@voltify.com");
        home.setPowerQuotaWatt(8800.0);
        home.setBudgetQuotaTry(1500.0);
        home.setBaseRate(2.07);
        home.setPenaltyRate(5.18);
        home.setSquareMeters(120);
        home.setRoomLayout("2+1");

        List<Appliance> apps = new ArrayList<>();
        apps.add(makeAppliance(home, "Buzdolabı", 350.0, "Salon", "Soğutucu"));
        apps.add(makeAppliance(home, "Bulaşık Makinesi", 1800.0, "Salon", "Beyaz Eşya"));
        apps.add(makeAppliance(home, "Televizyon", 400.0, "Salon", "Elektronik"));
        home.setAppliances(apps);

        Home savedHome = homeRepository.save(home);

        BillingLedger ledger = new BillingLedger();
        ledger.setHome(savedHome);
        billingLedgerRepository.save(ledger);

        System.out.println("👤 Demo hesap oluşturuldu -> kullanıcı: admin, şifre: admin123 (+ Demo Ev)");
    }

    private Appliance makeAppliance(Home home, String name, double limit, String room, String type) {
        Appliance a = new Appliance();
        a.setHome(home);
        a.setName(name);
        a.setSafePowerLimit(limit);
        a.setRoom(room);
        a.setType(type);
        a.setPowerOn(true);
        return a;
    }
}
