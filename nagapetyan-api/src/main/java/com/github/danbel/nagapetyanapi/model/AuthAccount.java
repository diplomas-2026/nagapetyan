package com.github.danbel.nagapetyanapi.model;

public record AuthAccount(
        ActorRole role,
        Long organizationId,
        String login,
        String fullName,
        String position,
        String passwordHash
) {
}
