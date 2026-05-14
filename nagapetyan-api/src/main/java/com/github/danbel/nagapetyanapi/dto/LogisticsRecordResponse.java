package com.github.danbel.nagapetyanapi.dto;

import com.github.danbel.nagapetyanapi.model.ReportStatus;

import java.time.Instant;
import java.time.LocalDate;

public record LogisticsRecordResponse(
        Long id,
        Long organizationId,
        String shipmentNumber,
        String routeFrom,
        String routeTo,
        LocalDate shippedAt,
        LocalDate plannedDeliveryDate,
        LocalDate deliveredAt,
        ReportStatus status,
        String responsibleDepartment,
        String note,
        Instant createdAt,
        long transitDays,
        boolean delayed
) {
}
