package com.voltify.core.repository;

import com.voltify.core.entity.EventLog;
import com.voltify.core.entity.Home;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventLogRepository extends JpaRepository<EventLog, Long> {
    List<EventLog> findByHomeOrderByTimestampDesc(Home home);
    List<EventLog> findByHomeIdOrderByTimestampDesc(Long homeId);
}