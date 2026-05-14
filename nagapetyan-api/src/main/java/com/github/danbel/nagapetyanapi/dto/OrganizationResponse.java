package com.github.danbel.nagapetyanapi.dto;

import java.time.Instant;

public record OrganizationResponse(
        Long id,
        String name,
        String inn,
        String region,
        String description,
        Instant createdAt,
        long ownersCount,
        long employeesCount,
        long reportsCount
) {
}
