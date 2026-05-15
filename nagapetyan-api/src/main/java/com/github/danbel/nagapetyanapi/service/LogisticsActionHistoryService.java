package com.github.danbel.nagapetyanapi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.danbel.nagapetyanapi.dto.LogisticsActionHistoryResponse;
import com.github.danbel.nagapetyanapi.dto.LogisticsRecordSnapshot;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.LogisticsActionHistory;
import com.github.danbel.nagapetyanapi.model.LogisticsActionType;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class LogisticsActionHistoryService {

    private final InMemoryStore store;
    private final AccessService accessService;
    private final MapperService mapperService;
    private final ObjectMapper objectMapper;

    public LogisticsActionHistoryService(InMemoryStore store, AccessService accessService, MapperService mapperService, ObjectMapper objectMapper) {
        this.store = store;
        this.accessService = accessService;
        this.mapperService = mapperService;
        this.objectMapper = objectMapper;
    }

    public List<LogisticsActionHistoryResponse> listHistory(ActorContext context, Long organizationId, String actorLogin) {
        accessService.requireOrganizationRead(context, organizationId);
        String effectiveActorLogin = actorLogin;
        if (effectiveActorLogin == null || effectiveActorLogin.isBlank()) {
            effectiveActorLogin = context.role() == com.github.danbel.nagapetyanapi.model.ActorRole.SYSTEM_ADMIN
                    ? null
                    : context.login();
        }
        List<LogisticsActionHistory> histories = effectiveActorLogin == null || effectiveActorLogin.isBlank()
                ? store.getActionHistoryByOrganization(organizationId)
                : store.getActionHistoryByOrganizationAndActorLogin(organizationId, effectiveActorLogin);
        return histories.stream()
                .map(mapperService::toActionHistoryResponse)
                .toList();
    }

    @Transactional
    public void recordCreated(ActorContext context, LogisticsRecord record) {
        saveHistory(context, LogisticsActionType.CREATED, record, null, buildCreatedSummary(record), null);
    }

    @Transactional
    public void recordUpdated(ActorContext context, LogisticsRecord before, LogisticsRecord after) {
        saveHistory(context, LogisticsActionType.UPDATED, after, snapshot(before), buildUpdatedSummary(before, after), snapshot(after));
    }

    @Transactional
    public void recordDeleted(ActorContext context, LogisticsRecord before) {
        saveHistory(context, LogisticsActionType.DELETED, before, snapshot(before), buildDeletedSummary(before), null);
    }

    @Transactional
    public LogisticsActionHistoryResponse revertAction(ActorContext context, Long organizationId, Long historyId) {
        accessService.requireOrganizationWrite(context, organizationId);
        LogisticsActionHistory history = store.getActionHistory(historyId);
        if (history == null || !organizationId.equals(history.getOrganizationId())) {
            throw new ResponseStatusException(NOT_FOUND, "Действие не найдено");
        }
        if (history.isReverted()) {
            return mapperService.toActionHistoryResponse(history);
        }

        LogisticsRecord record = store.getRecord(history.getRecordId());
        if (record == null && history.getActionType() != LogisticsActionType.CREATED) {
            throw new ResponseStatusException(NOT_FOUND, "Отправление не найдено");
        }

        switch (history.getActionType()) {
            case CREATED -> {
                if (record != null) {
                    record.setDeletedAt(Instant.now());
                    store.saveRecord(record);
                }
            }
            case UPDATED, DELETED -> {
                LogisticsRecordSnapshot snapshot = deserialize(history.getBeforeState());
                if (snapshot == null) {
                    throw new ResponseStatusException(NOT_FOUND, "Невозможно восстановить отправление");
                }
                if (record == null) {
                    record = new LogisticsRecord();
                    record.setId(snapshot.id());
                    record.setOrganizationId(snapshot.organizationId());
                }
                applySnapshot(record, snapshot);
                store.saveRecord(record);
            }
        }

        history.setReverted(true);
        history.setRevertedAt(Instant.now());
        store.saveActionHistory(history);
        return mapperService.toActionHistoryResponse(history);
    }

    private void saveHistory(ActorContext context,
                             LogisticsActionType actionType,
                             LogisticsRecord record,
                             LogisticsRecordSnapshot beforeState,
                             String summary,
                             LogisticsRecordSnapshot afterState) {
        LogisticsActionHistory history = new LogisticsActionHistory();
        history.setOrganizationId(record.getOrganizationId());
        history.setActorLogin(context.login() == null ? "unknown" : context.login());
        history.setActorFullName(context.fullName() == null ? "Неизвестный пользователь" : context.fullName());
        history.setActionType(actionType);
        history.setRecordId(record.getId());
        history.setRecordShipmentNumber(record.getShipmentNumber());
        history.setSummary(summary);
        history.setBeforeState(serialize(beforeState));
        history.setAfterState(serialize(afterState));
        history.setReverted(false);
        history.setCreatedAt(Instant.now());
        store.saveActionHistory(history);
    }

    private String buildCreatedSummary(LogisticsRecord record) {
        return "Создал отправление " + record.getShipmentNumber();
    }

    private String buildDeletedSummary(LogisticsRecord record) {
        return "Удалил отправление " + record.getShipmentNumber();
    }

    private String buildUpdatedSummary(LogisticsRecord before, LogisticsRecord after) {
        List<String> changes = new ArrayList<>();
        addChange(changes, "номер", before.getShipmentNumber(), after.getShipmentNumber());
        addChange(changes, "маршрут", joinRoute(before.getRouteFrom(), before.getRouteTo()), joinRoute(after.getRouteFrom(), after.getRouteTo()));
        addChange(changes, "координаты отправки", joinPoint(before.getRouteFromLatitude(), before.getRouteFromLongitude()), joinPoint(after.getRouteFromLatitude(), after.getRouteFromLongitude()));
        addChange(changes, "координаты назначения", joinPoint(before.getRouteToLatitude(), before.getRouteToLongitude()), joinPoint(after.getRouteToLatitude(), after.getRouteToLongitude()));
        addChange(changes, "вес", formatDecimal(before.getWeight()), formatDecimal(after.getWeight()));
        addChange(changes, "стоимость", formatDecimal(before.getCost()), formatDecimal(after.getCost()));
        addChange(changes, "статус", statusLabel(before.getStatus()), statusLabel(after.getStatus()));
        if (changes.isEmpty()) {
            return "Обновил отправление " + after.getShipmentNumber();
        }
        return "Обновил отправление " + after.getShipmentNumber() + ", изменил " + String.join(", ", changes);
    }

    private void addChange(List<String> changes, String label, String before, String after) {
        if (!Objects.equals(before, after)) {
            changes.add(label + " с " + before + " на " + after);
        }
    }

    private String joinRoute(String from, String to) {
        return (from == null ? "" : from) + " → " + (to == null ? "" : to);
    }

    private String joinPoint(BigDecimal latitude, BigDecimal longitude) {
        if (latitude == null && longitude == null) {
            return "-";
        }
        return formatDecimal(latitude) + ", " + formatDecimal(longitude);
    }

    private String formatDecimal(BigDecimal value) {
        if (value == null) {
            return "-";
        }
        return value.stripTrailingZeros().toPlainString();
    }

    private String statusLabel(com.github.danbel.nagapetyanapi.model.ReportStatus status) {
        if (status == null) {
            return "-";
        }
        return switch (status) {
            case IN_TRANSIT -> "В пути";
            case DELIVERED -> "Доставлено";
            case DELAYED -> "С задержкой";
            case CANCELED -> "Отменено";
        };
    }

    private String serialize(LogisticsRecordSnapshot snapshot) {
        if (snapshot == null) {
            return null;
        }
        return objectMapper.writeValueAsString(snapshot);
    }

    private LogisticsRecordSnapshot deserialize(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        return objectMapper.readValue(json, LogisticsRecordSnapshot.class);
    }

    private LogisticsRecordSnapshot snapshot(LogisticsRecord record) {
        if (record == null) {
            return null;
        }
        return new LogisticsRecordSnapshot(
                record.getId(),
                record.getOrganizationId(),
                record.getShipmentNumber(),
                record.getRouteFrom(),
                record.getRouteFromLatitude(),
                record.getRouteFromLongitude(),
                record.getRouteTo(),
                record.getRouteToLatitude(),
                record.getRouteToLongitude(),
                record.getShippedAt(),
                record.getPlannedDeliveryDate(),
                record.getWeight(),
                record.getCost(),
                record.getDeliveredAt(),
                record.getStatus(),
                record.getResponsibleDepartment(),
                record.getNote(),
                record.getDeletedAt()
        );
    }

    private void applySnapshot(LogisticsRecord record, LogisticsRecordSnapshot snapshot) {
        record.setId(snapshot.id());
        record.setOrganizationId(snapshot.organizationId());
        record.setShipmentNumber(snapshot.shipmentNumber());
        record.setRouteFrom(snapshot.routeFrom());
        record.setRouteFromLatitude(snapshot.routeFromLatitude());
        record.setRouteFromLongitude(snapshot.routeFromLongitude());
        record.setRouteTo(snapshot.routeTo());
        record.setRouteToLatitude(snapshot.routeToLatitude());
        record.setRouteToLongitude(snapshot.routeToLongitude());
        record.setShippedAt(snapshot.shippedAt());
        record.setPlannedDeliveryDate(snapshot.plannedDeliveryDate());
        record.setWeight(snapshot.weight());
        record.setCost(snapshot.cost());
        record.setDeliveredAt(snapshot.deliveredAt());
        record.setStatus(snapshot.status());
        record.setResponsibleDepartment(snapshot.responsibleDepartment());
        record.setNote(snapshot.note());
        record.setDeletedAt(snapshot.deletedAt());
    }
}
