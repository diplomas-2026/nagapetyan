package com.github.danbel.nagapetyanapi.repository;

import com.github.danbel.nagapetyanapi.model.LogisticsRecordMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogisticsRecordMovementRepository extends JpaRepository<LogisticsRecordMovement, Long> {
    List<LogisticsRecordMovement> findByRecordIdOrderBySortOrderAsc(Long recordId);

    void deleteByRecordId(Long recordId);
}
