package com.github.danbel.nagapetyanapi.dto;

import com.github.danbel.nagapetyanapi.model.ActorRole;

import java.time.Instant;

public record MemberResponse(
        Long id,
        Long organizationId,
        String fullName,
        String email,
        String position,
        ActorRole role,
        Instant createdAt
) {
}
