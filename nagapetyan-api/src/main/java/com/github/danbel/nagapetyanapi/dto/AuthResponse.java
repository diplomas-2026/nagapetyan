package com.github.danbel.nagapetyanapi.dto;

public record AuthResponse(
        String token,
        AuthUserResponse user
) {
}
