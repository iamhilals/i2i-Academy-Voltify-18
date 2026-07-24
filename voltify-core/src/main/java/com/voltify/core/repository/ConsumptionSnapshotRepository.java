package com.voltify.core.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.voltify.core.entity.ConsumptionSnapshot;
import com.voltify.core.entity.Home;

@Repository
public interface ConsumptionSnapshotRepository extends JpaRepository<ConsumptionSnapshot, Long> {
    List<ConsumptionSnapshot> findByHomeIdOrderBySnapshotDateAsc(Long homeId);
    Optional<ConsumptionSnapshot> findByHomeAndSnapshotDate(Home home, LocalDate snapshotDate);

    @Query("SELECT s FROM ConsumptionSnapshot s WHERE s.home.id = :homeId " +
           "AND (:fromDate IS NULL OR s.snapshotDate >= :fromDate) " +
           "AND (:toDate IS NULL OR s.snapshotDate <= :toDate) " +
           "ORDER BY s.snapshotDate DESC")
    Page<ConsumptionSnapshot> findByHomeIdAndDateRange(
            @Param("homeId") Long homeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);
}