package com.voltify.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.voltify.core.entity.Home;

@Repository
public interface HomeRepository extends JpaRepository<Home, Long> {
    // JpaRepository sayesinde save(), findAll(), findById() gibi metotlar otomatik gelir.
}