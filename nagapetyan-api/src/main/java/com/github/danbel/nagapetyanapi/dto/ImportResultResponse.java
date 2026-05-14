package com.github.danbel.nagapetyanapi.dto;

public record ImportResultResponse(
        long imported,
        long skipped
) {
}
