package com.voltify.core.repository;

import com.voltify.core.entity.ConsumptionSnapshot;
import com.voltify.core.entity.Home;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConsumptionSnapshotRepository extends JpaRepository<ConsumptionSnapshot, Long> {
    List<ConsumptionSnapshot> findByHomeIdOrderBySnapshotDateAsc(Long homeId);
    Optional<ConsumptionSnapshot> findByHomeAndSnapshotDate(Home home, LocalDate snapshotDate);
}