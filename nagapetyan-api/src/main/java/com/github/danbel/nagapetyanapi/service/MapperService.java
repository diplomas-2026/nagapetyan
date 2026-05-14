package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.DashboardResponse;
import com.github.danbel.nagapetyanapi.dto.AuthUserResponse;
import com.github.danbel.nagapetyanapi.dto.LogisticsRecordMovementResponse;
import com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse;
import com.github.danbel.nagapetyanapi.dto.MemberResponse;
import com.github.danbel.nagapetyanapi.dto.OrganizationResponse;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import com.github.danbel.nagapetyanapi.model.LogisticsRecordMovement;
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
                member.getLogin(),
                member.getFullName(),
                member.getEmail(),
                member.getPosition(),
                member.getRole(),
                member.getCreatedAt()
        );
    }

    public AuthUserResponse toAuthUserResponse(OrganizationMember member) {
        return new AuthUserResponse(
                member.getId(),
                member.getLogin(),
                member.getFullName(),
                member.getEmail(),
                member.getPosition(),
                member.getRole(),
                member.getOrganizationId(),
                member.getCreatedAt()
        );
    }

    public AuthUserResponse toAuthUserResponse(com.github.danbel.nagapetyanapi.model.AuthAccount account) {
        return new AuthUserResponse(
                null,
                account.login(),
                account.fullName(),
                null,
                null,
                account.role(),
                account.organizationId(),
                null
        );
    }

    public LogisticsRecordResponse toRecordResponse(LogisticsRecord record) {
        return toRecordResponse(record, List.of());
    }

    public LogisticsRecordResponse toRecordResponse(LogisticsRecord record, List<LogisticsRecordMovement> movements) {
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
                delayed,
                movements.stream()
                        .map(this::toMovementResponse)
                        .toList()
        );
    }

    public LogisticsRecordMovementResponse toMovementResponse(LogisticsRecordMovement movement) {
        return new LogisticsRecordMovementResponse(
                movement.getId(),
                movement.getRecordId(),
                movement.getMovementType(),
                movement.getTitle(),
                movement.getLocation(),
                movement.getEventDate(),
                movement.getDescription(),
                movement.getSortOrder() == null ? 0 : movement.getSortOrder()
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
