package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.LogisticsRecordMovementRequest;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import com.github.danbel.nagapetyanapi.model.LogisticsRecordMovement;
import com.github.danbel.nagapetyanapi.model.Organization;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MovementService {

    private final InMemoryStore store;
    private final AccessService accessService;
    private final MapperService mapperService;

    public MovementService(InMemoryStore store, AccessService accessService, MapperService mapperService) {
        this.store = store;
        this.accessService = accessService;
        this.mapperService = mapperService;
    }

    public List<LogisticsRecordMovement> listMovements(ActorContext context, Long organizationId, Long recordId) {
        accessService.requireOrganizationRead(context, organizationId);
        LogisticsRecord record = requireRecord(organizationId, recordId);
        return store.getMovementsByRecordId(record.getId());
    }

    public LogisticsRecordMovement getMovement(ActorContext context, Long organizationId, Long recordId, Long movementId) {
        accessService.requireOrganizationRead(context, organizationId);
        LogisticsRecord record = requireRecord(organizationId, recordId);
        LogisticsRecordMovement movement = requireMovement(movementId);
        if (!record.getId().equals(movement.getRecordId())) {
            throw new ResponseStatusException(NOT_FOUND, "Этап не найден");
        }
        return movement;
    }

    @Transactional
    public LogisticsRecordMovement createMovement(ActorContext context, Long organizationId, Long recordId, LogisticsRecordMovementRequest request) {
        accessService.requireOrganizationWrite(context, organizationId);
        LogisticsRecord record = requireRecord(organizationId, recordId);
        LogisticsRecordMovement movement = new LogisticsRecordMovement();
        movement.setRecordId(record.getId());
        apply(movement, request);
        movement.setSortOrder(nextSortOrder(record.getId()));
        return store.saveMovement(movement);
    }

    @Transactional
    public LogisticsRecordMovement updateMovement(ActorContext context, Long organizationId, Long recordId, Long movementId, LogisticsRecordMovementRequest request) {
        accessService.requireOrganizationWrite(context, organizationId);
        requireRecord(organizationId, recordId);
        LogisticsRecordMovement movement = requireMovement(movementId);
        if (!recordId.equals(movement.getRecordId())) {
            throw new ResponseStatusException(NOT_FOUND, "Этап не найден");
        }
        Integer existingSortOrder = movement.getSortOrder();
        apply(movement, request);
        movement.setSortOrder(existingSortOrder);
        return store.saveMovement(movement);
    }

    @Transactional
    public void deleteMovement(ActorContext context, Long organizationId, Long recordId, Long movementId) {
        accessService.requireOrganizationWrite(context, organizationId);
        requireRecord(organizationId, recordId);
        LogisticsRecordMovement movement = requireMovement(movementId);
        if (!recordId.equals(movement.getRecordId())) {
            throw new ResponseStatusException(NOT_FOUND, "Этап не найден");
        }
        store.deleteMovement(movementId);
        reindex(recordId);
    }

    public com.github.danbel.nagapetyanapi.dto.LogisticsRecordMovementResponse toResponse(LogisticsRecordMovement movement) {
        return mapperService.toMovementResponse(movement);
    }

    private LogisticsRecord requireRecord(Long organizationId, Long recordId) {
        Organization organization = store.getOrganization(organizationId);
        if (organization == null) {
            throw new ResponseStatusException(NOT_FOUND, "Организация не найдена");
        }
        LogisticsRecord record = store.getRecord(recordId);
        if (record == null || !organizationId.equals(record.getOrganizationId())) {
            throw new ResponseStatusException(NOT_FOUND, "Запись не найдена");
        }
        return record;
    }

    private LogisticsRecordMovement requireMovement(Long movementId) {
        LogisticsRecordMovement movement = store.getMovement(movementId);
        if (movement == null) {
            throw new ResponseStatusException(NOT_FOUND, "Этап не найден");
        }
        return movement;
    }

    private void apply(LogisticsRecordMovement movement, LogisticsRecordMovementRequest request) {
        movement.setMovementType(request.movementType());
        movement.setTitle(request.title());
        movement.setLocation(request.location());
        movement.setEventDate(request.eventDate());
        movement.setDescription(request.description());
    }

    private Integer nextSortOrder(Long recordId) {
        return store.getMovementsByRecordId(recordId).stream()
                .mapToInt(item -> item.getSortOrder() == null ? 0 : item.getSortOrder())
                .max()
                .orElse(0) + 1;
    }

    private void reindex(Long recordId) {
        List<LogisticsRecordMovement> movements = store.getMovementsByRecordId(recordId);
        int index = 1;
        for (LogisticsRecordMovement movement : movements) {
            if (movement.getSortOrder() == null || movement.getSortOrder() != index) {
                movement.setSortOrder(index);
                store.saveMovement(movement);
            }
            index++;
        }
    }
}
