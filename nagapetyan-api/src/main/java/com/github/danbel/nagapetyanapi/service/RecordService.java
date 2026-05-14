package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.LogisticsRecordRequest;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import com.github.danbel.nagapetyanapi.model.LogisticsRecordMovement;
import com.github.danbel.nagapetyanapi.model.Organization;
import com.github.danbel.nagapetyanapi.model.ReportStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class RecordService {

    private final InMemoryStore store;
    private final AccessService accessService;
    private final MapperService mapperService;

    public RecordService(InMemoryStore store, AccessService accessService, MapperService mapperService) {
        this.store = store;
        this.accessService = accessService;
        this.mapperService = mapperService;
    }

    public List<LogisticsRecord> listRecords(ActorContext context, Long organizationId) {
        accessService.requireOrganizationRead(context, organizationId);
        return store.getRecordsByOrganization(organizationId);
    }

    @Transactional
    public LogisticsRecord createRecord(ActorContext context, Long organizationId, LogisticsRecordRequest request) {
        accessService.requireOrganizationWrite(context, organizationId);
        Organization organization = store.getOrganization(organizationId);
        if (organization == null) {
            throw new ResponseStatusException(NOT_FOUND, "Организация не найдена");
        }
        LogisticsRecord record = new LogisticsRecord();
        record.setOrganizationId(organizationId);
        apply(record, request);
        record = store.saveRecord(record);
        saveDefaultMovements(record);
        return record;
    }

    @Transactional
    public LogisticsRecord updateRecord(ActorContext context, Long organizationId, Long recordId, LogisticsRecordRequest request) {
        accessService.requireOrganizationWrite(context, organizationId);
        LogisticsRecord record = store.getRecord(recordId);
        if (record == null || !organizationId.equals(record.getOrganizationId())) {
            throw new ResponseStatusException(NOT_FOUND, "Запись не найдена");
        }
        apply(record, request);
        return store.saveRecord(record);
    }

    @Transactional
    public void deleteRecord(ActorContext context, Long organizationId, Long recordId) {
        accessService.requireOrganizationWrite(context, organizationId);
        LogisticsRecord record = store.getRecord(recordId);
        if (record == null || !organizationId.equals(record.getOrganizationId())) {
            throw new ResponseStatusException(NOT_FOUND, "Запись не найдена");
        }
        store.deleteRecord(recordId);
    }

    public List<com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse> listRecordResponses(ActorContext context, Long organizationId) {
        return listRecords(context, organizationId).stream()
                .map(record -> mapperService.toRecordResponse(record, List.of()))
                .toList();
    }

    public com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse getRecordResponse(ActorContext context, Long organizationId, Long recordId) {
        accessService.requireOrganizationRead(context, organizationId);
        LogisticsRecord record = store.getRecord(recordId);
        if (record == null || !organizationId.equals(record.getOrganizationId())) {
            throw new ResponseStatusException(NOT_FOUND, "Запись не найдена");
        }
        return mapperService.toRecordResponse(record, store.getMovementsByRecordId(recordId));
    }

    public com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse createRecordResponse(ActorContext context, Long organizationId, LogisticsRecordRequest request) {
        LogisticsRecord record = createRecord(context, organizationId, request);
        return mapperService.toRecordResponse(record, store.getMovementsByRecordId(record.getId()));
    }

    public com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse updateRecordResponse(ActorContext context, Long organizationId, Long recordId, LogisticsRecordRequest request) {
        LogisticsRecord record = updateRecord(context, organizationId, recordId, request);
        return mapperService.toRecordResponse(record, store.getMovementsByRecordId(record.getId()));
    }

    private void apply(LogisticsRecord record, LogisticsRecordRequest request) {
        record.setShipmentNumber(request.shipmentNumber());
        record.setRouteFrom(request.routeFrom());
        record.setRouteTo(request.routeTo());
        record.setShippedAt(request.shippedAt());
        record.setPlannedDeliveryDate(request.plannedDeliveryDate());
        record.setDeliveredAt(request.deliveredAt());
        record.setStatus(request.status());
        record.setResponsibleDepartment(request.responsibleDepartment());
        record.setNote(request.note());
    }

    private void saveDefaultMovements(LogisticsRecord record) {
        List<LogisticsRecordMovement> movements = buildDefaultMovements(record);
        for (LogisticsRecordMovement movement : movements) {
            store.saveMovement(movement);
        }
    }

    private List<LogisticsRecordMovement> buildDefaultMovements(LogisticsRecord record) {
        List<LogisticsRecordMovement> movements = new ArrayList<>();
        LocalDate shippedAt = record.getShippedAt();
        LocalDate plannedDeliveryDate = record.getPlannedDeliveryDate();
        LocalDate deliveredAt = record.getDeliveredAt();

        movements.add(buildMovement(record, 1, "CREATED", "Создано отправление", record.getRouteFrom(), shippedAt, "Отправление внесено в систему"));
        movements.add(buildMovement(record, 2, "ACCEPTED", "Принято на обработку", record.getResponsibleDepartment(), shippedAt.plusDays(1), "Передано в логистический центр"));

        if (record.getStatus() == ReportStatus.DELIVERED) {
            movements.add(buildMovement(record, 3, "DELIVERED", "Доставлено", record.getRouteTo(), deliveredAt != null ? deliveredAt : plannedDeliveryDate, "Получено адресатом"));
        } else if (record.getStatus() == ReportStatus.DELAYED) {
            movements.add(buildMovement(record, 3, "DELAYED", "С задержкой", record.getRouteTo(), deliveredAt != null ? deliveredAt : plannedDeliveryDate, "Срок доставки нарушен"));
        } else if (record.getStatus() == ReportStatus.CANCELED) {
            movements.add(buildMovement(record, 3, "CANCELED", "Отменено", record.getRouteFrom(), plannedDeliveryDate, "Отправление отменено"));
        } else {
            movements.add(buildMovement(record, 3, "IN_TRANSIT", "В пути", record.getRouteTo(), plannedDeliveryDate, "Отправление находится в пути"));
        }

        return movements;
    }

    private LogisticsRecordMovement buildMovement(LogisticsRecord record,
                                                  int sortOrder,
                                                  String movementType,
                                                  String title,
                                                  String location,
                                                  LocalDate eventDate,
                                                  String description) {
        LogisticsRecordMovement movement = new LogisticsRecordMovement();
        movement.setRecordId(record.getId());
        movement.setSortOrder(sortOrder);
        movement.setMovementType(movementType);
        movement.setTitle(title);
        movement.setLocation(location);
        movement.setEventDate(eventDate == null ? record.getShippedAt() : eventDate);
        movement.setDescription(description);
        return movement;
    }
}
