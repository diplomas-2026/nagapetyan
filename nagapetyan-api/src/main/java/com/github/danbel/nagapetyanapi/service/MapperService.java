package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.DashboardResponse;
import com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse;
import com.github.danbel.nagapetyanapi.dto.MemberResponse;
import com.github.danbel.nagapetyanapi.dto.OrganizationResponse;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import com.github.danbel.nagapetyanapi.model.Organization;
import com.github.danbel.nagapetyanapi.model.OrganizationMember;

import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class MapperService {

    public OrganizationResponse toOrganizationResponse(Organization organization, long ownersCount, long employeesCount, long reportsCount) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getName(),
                organization.getInn(),
                organization.getRegion(),
                organization.getDescription(),
                organization.getCreatedAt(),
                ownersCount,
                employeesCount,
                reportsCount
        );
    }

    public MemberResponse toMemberResponse(OrganizationMember member) {
        return new MemberResponse(
                member.getId(),
                member.getOrganizationId(),
                member.getFullName(),
                member.getEmail(),
                member.getPosition(),
                member.getRole(),
                member.getCreatedAt()
        );
    }

    public LogisticsRecordResponse toRecordResponse(LogisticsRecord record) {
        long transitDays = record.getDeliveredAt() == null || record.getShippedAt() == null
                ? 0
                : ChronoUnit.DAYS.between(record.getShippedAt(), record.getDeliveredAt());
        boolean delayed = record.getDeliveredAt() != null
                && record.getPlannedDeliveryDate() != null
                && record.getDeliveredAt().isAfter(record.getPlannedDeliveryDate());

        return new LogisticsRecordResponse(
                record.getId(),
                record.getOrganizationId(),
                record.getShipmentNumber(),
                record.getRouteFrom(),
                record.getRouteTo(),
                record.getShippedAt(),
                record.getPlannedDeliveryDate(),
                record.getDeliveredAt(),
                record.getStatus(),
                record.getResponsibleDepartment(),
                record.getNote(),
                record.getCreatedAt(),
                transitDays,
                delayed
        );
    }

    public DashboardResponse toDashboardResponse(OrganizationResponse organization, List<LogisticsRecordResponse> records) {
        long total = records.size();
        long deliveredOnTime = records.stream().filter(record -> record.deliveredAt() != null && !record.delayed()).count();
        long delayed = records.stream().filter(LogisticsRecordResponse::delayed).count();
        double onTimePercent = total == 0 ? 0 : (double) deliveredOnTime * 100 / total;
        double averageTransitDays = total == 0 ? 0 : records.stream().mapToLong(LogisticsRecordResponse::transitDays).average().orElse(0);

        List<LogisticsRecordResponse> recent = records.stream()
                .sorted(Comparator.comparing(LogisticsRecordResponse::createdAt).reversed())
                .limit(5)
                .toList();

        return new DashboardResponse(
                organization,
                new DashboardResponse.Summary(total, deliveredOnTime, delayed, onTimePercent, averageTransitDays),
                recent
        );
    }
}
