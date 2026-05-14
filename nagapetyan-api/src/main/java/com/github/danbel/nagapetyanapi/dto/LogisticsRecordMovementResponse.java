package com.github.danbel.nagapetyanapi.dto;

import java.time.LocalDate;

public record LogisticsRecordMovementResponse(
        Long id,
        Long recordId,
        String movementType,
        String title,
        String location,
        LocalDate eventDate,
        String description,
        int sortOrder
) {
}
