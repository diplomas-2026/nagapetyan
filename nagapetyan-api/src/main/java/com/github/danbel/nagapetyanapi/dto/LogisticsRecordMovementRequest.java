package com.github.danbel.nagapetyanapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LogisticsRecordMovementRequest(
        @NotBlank String movementType,
        @NotBlank String title,
        String location,
        @NotNull LocalDate eventDate,
        String description,
        Integer sortOrder
) {
}
