package com.github.danbel.nagapetyanapi.dto;

import com.github.danbel.nagapetyanapi.model.ReportStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record LogisticsRecordSnapshot(
        Long id,
        Long organizationId,
        String shipmentNumber,
        String routeFrom,
        java.math.BigDecimal routeFromLatitude,
        java.math.BigDecimal routeFromLongitude,
        String routeTo,
        java.math.BigDecimal routeToLatitude,
        java.math.BigDecimal routeToLongitude,
        LocalDate shippedAt,
        LocalDate plannedDeliveryDate,
        BigDecimal weight,
        BigDecimal cost,
        LocalDate deliveredAt,
        ReportStatus status,
        String responsibleDepartment,
        String note,
        Instant deletedAt
) {
}
