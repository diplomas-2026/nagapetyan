package com.github.danbel.nagapetyanapi.repository;

import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogisticsRecordRepository extends JpaRepository<LogisticsRecord, Long> {
    List<LogisticsRecord> findByOrganizationIdAndDeletedAtIsNullOrderByIdAsc(Long organizationId);
}
