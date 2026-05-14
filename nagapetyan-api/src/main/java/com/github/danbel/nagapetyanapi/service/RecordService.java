package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.LogisticsRecordRequest;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import com.github.danbel.nagapetyanapi.model.Organization;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public LogisticsRecord createRecord(ActorContext context, Long organizationId, LogisticsRecordRequest request) {
        accessService.requireOrganizationWrite(context, organizationId);
        Organization organization = store.getOrganization(organizationId);
        if (organization == null) {
            throw new ResponseStatusException(NOT_FOUND, "Организация не найдена");
        }
        LogisticsRecord record = new LogisticsRecord();
        record.setOrganizationId(organizationId);
        apply(record, request);
        return store.saveRecord(record);
    }

    public LogisticsRecord updateRecord(ActorContext context, Long organizationId, Long recordId, LogisticsRecordRequest request) {
        accessService.requireOrganizationWrite(context, organizationId);
        LogisticsRecord record = store.getRecord(recordId);
        if (record == null || !organizationId.equals(record.getOrganizationId())) {
            throw new ResponseStatusException(NOT_FOUND, "Запись не найдена");
        }
        apply(record, request);
        return store.saveRecord(record);
    }

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
                .map(mapperService::toRecordResponse)
                .toList();
    }

    public com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse createRecordResponse(ActorContext context, Long organizationId, LogisticsRecordRequest request) {
        return mapperService.toRecordResponse(createRecord(context, organizationId, request));
    }

    public com.github.danbel.nagapetyanapi.dto.LogisticsRecordResponse updateRecordResponse(ActorContext context, Long organizationId, Long recordId, LogisticsRecordRequest request) {
        return mapperService.toRecordResponse(updateRecord(context, organizationId, recordId, request));
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
}
