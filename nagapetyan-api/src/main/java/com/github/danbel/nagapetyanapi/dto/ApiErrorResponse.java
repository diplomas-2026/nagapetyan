package com.github.danbel.nagapetyanapi.dto;

import java.time.Instant;

public record ApiErrorResponse(
        String message,
        Instant timestamp
) {
}
