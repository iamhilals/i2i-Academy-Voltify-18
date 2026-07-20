package com.voltify.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.voltify.core.entity.Appliance;

@Repository
public interface ApplianceRepository extends JpaRepository<Appliance, Long> {
}