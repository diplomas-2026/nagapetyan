package com.github.danbel.nagapetyanapi.dto;

import java.util.List;

public record DashboardResponse(
        OrganizationResponse organization,
        Summary summary,
        List<LogisticsRecordResponse> recentRecords
) {
    public record Summary(
            long totalRecords,
            long deliveredOnTime,
            long delayed,
            double onTimePercent,
            double averageTransitDays
    ) {
    }
}
