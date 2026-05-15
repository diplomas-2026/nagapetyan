package com.github.danbel.nagapetyanapi.repository;

import com.github.danbel.nagapetyanapi.model.LogisticsActionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogisticsActionHistoryRepository extends JpaRepository<LogisticsActionHistory, Long> {
    List<LogisticsActionHistory> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    List<LogisticsActionHistory> findByOrganizationIdAndActorLoginOrderByCreatedAtDesc(Long organizationId, String actorLogin);
}
