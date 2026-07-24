package com.voltify.core.repository;

import com.voltify.core.entity.AiRecommendation;
import com.voltify.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiRecommendationRepository extends JpaRepository<AiRecommendation, Long> {
    List<AiRecommendation> findByHomeIdOrderByCreatedAtDesc(Long homeId);

    // Bir kullanıcının tüm evlerine ait uyarı/tavsiye geçmişi (gelen kutusu için, en yeni önce)
    @Query("SELECT r FROM AiRecommendation r WHERE r.home.owner = :owner ORDER BY r.createdAt DESC")
    List<AiRecommendation> findByOwnerOrderByCreatedAtDesc(@Param("owner") User owner);
}