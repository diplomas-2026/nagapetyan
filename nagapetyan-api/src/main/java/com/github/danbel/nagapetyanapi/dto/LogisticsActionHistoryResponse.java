package com.github.danbel.nagapetyanapi.dto;

import com.github.danbel.nagapetyanapi.model.LogisticsActionType;

import java.time.Instant;

public record LogisticsActionHistoryResponse(
        Long id,
        Long organizationId,
        String actorLogin,
        String actorFullName,
        LogisticsActionType actionType,
        Long recordId,
        String recordShipmentNumber,
        String summary,
        boolean reverted,
        boolean canRevert,
        Instant createdAt
) {
}
