package com.github.danbel.nagapetyanapi.model;

public record AuthSession(
        String token,
        ActorRole role,
        Long organizationId,
        String login,
        String fullName
) {
}
