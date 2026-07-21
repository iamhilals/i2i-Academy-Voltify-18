package com.voltify.core.repository;

import com.voltify.core.entity.BillingLedger;
import com.voltify.core.entity.Home;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillingLedgerRepository extends JpaRepository<BillingLedger, Long> {
    Optional<BillingLedger> findByHome(Home home);
    Optional<BillingLedger> findByHomeId(Long homeId);
}