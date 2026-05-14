package com.github.danbel.nagapetyanapi.dto;

import com.github.danbel.nagapetyanapi.model.ActorRole;

import java.time.Instant;

public record AuthUserResponse(
        Long id,
        String login,
        String fullName,
        String email,
        String position,
        ActorRole role,
        Long organizationId,
        Instant createdAt
) {
}
