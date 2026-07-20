package com.voltify.core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voltify.core.entity.Home;
import com.voltify.core.entity.User;

public interface HomeRepository extends JpaRepository<Home, Long> {

    List<Home> findByOwner(User owner);
}