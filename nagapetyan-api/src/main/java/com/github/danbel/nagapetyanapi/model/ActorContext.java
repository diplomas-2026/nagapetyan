package com.github.danbel.nagapetyanapi.model;

public record ActorContext(ActorRole role, Long organizationId, String login, String fullName) {
}
