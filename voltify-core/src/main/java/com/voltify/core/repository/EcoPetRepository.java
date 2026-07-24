package com.voltify.core.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.voltify.core.entity.EcoPet;
import com.voltify.core.entity.User;

public interface EcoPetRepository extends JpaRepository<EcoPet, Long> {
    Optional<EcoPet> findByUserId(Long userId);
    Optional<EcoPet> findByUser(User user);
}
