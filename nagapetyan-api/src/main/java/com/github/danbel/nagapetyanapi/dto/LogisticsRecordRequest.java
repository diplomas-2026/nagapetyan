package com.github.danbel.nagapetyanapi.dto;

import com.github.danbel.nagapetyanapi.model.ReportStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LogisticsRecordRequest(
        @NotBlank String shipmentNumber,
        @NotBlank String routeFrom,
        BigDecimal routeFromLatitude,
        BigDecimal routeFromLongitude,
        @NotBlank String routeTo,
        BigDecimal routeToLatitude,
        BigDecimal routeToLongitude,
        @NotNull LocalDate shippedAt,
        @NotNull LocalDate plannedDeliveryDate,
        @NotNull BigDecimal weight,
        @NotNull BigDecimal cost,
        LocalDate deliveredAt,
        @NotNull ReportStatus status,
        String responsibleDepartment,
        String note
) {
}
