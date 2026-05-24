### Рисунок 2.30 – Фрагменткода авторизации пользователя

### [Скрин кода](./img_1.png)

```java
public AuthResponse login(LoginRequest request) {
    AuthAccount account = store.findAccountByLogin(request.login());
    if (account == null || !account.passwordHash().equals(hashPassword(request.password()))) {
        throw new ResponseStatusException(UNAUTHORIZED, "Неверный логин или пароль");
    }

    String token = UUID.randomUUID().toString().replace("-", "");
    store.saveSession(new AuthSession(
            token,
            account.role(),
            account.organizationId(),
            account.login(),
            account.fullName()));

    OrganizationMember member = store.findMemberByLogin(account.login());
    AuthUserResponse user = new AuthUserResponse(
            member == null ? null : member.getId(),
            account.login(),
            account.fullName(),
            null,
            account.position(),
            account.role(),
            account.organizationId(),
            null);
    return new AuthResponse(token, user);
}
```

### Рисунок 2.31 – Фрагменткода контроллера организаций

### [Скрин кода](./img_2.png)

```java
@PutMapping("/{organizationId}")
public OrganizationResponse update(@RequestHeader(value = "Authorization", required = false) String authorization,
                                   @PathVariable Long organizationId,
                                   @Valid @RequestBody OrganizationRequest request) {
    return organizationService.updateOrganizationResponse(authService.requireContext(authorization), organizationId, request);
}
```

### Рисунок 2.32 – Фрагменткода контроллера отчетных записей

### [Скрин кода](./img_3.png)

```java
@PostMapping
public LogisticsRecordResponse create(@RequestHeader(value = "Authorization", required = false) String authorization,
                                      @PathVariable Long organizationId,
                                      @Valid @RequestBody LogisticsRecordRequest request) {
    return recordService.createRecordResponse(authService.requireContext(authorization), organizationId, request);
}
```

### Рисунок 2.33 – Фрагменткода сервиса отчетных записей

### [Скрин кода](./img_4.png)

```java
@Transactional
public LogisticsRecord updateRecord(ActorContext context, Long organizationId, Long recordId, LogisticsRecordRequest request) {
    accessService.requireOrganizationWrite(context, organizationId);
    LogisticsRecord record = store.getRecord(recordId);
    if (record == null || !organizationId.equals(record.getOrganizationId())) {
        throw new ResponseStatusException(NOT_FOUND, "Запись не найдена");
    }
    LogisticsRecord before = snapshot(record);
    apply(record, request);
    LogisticsRecord updated = store.saveRecord(record);
    actionHistoryService.recordUpdated(context, before, updated);
    return updated;
}
```

### Рисунок 2.34 – Фрагменткода импорта Excel и CSV

### [Скрин кода](./img_5.png)

```java
public ImportResultResponse importFile(ActorContext context, Long organizationId, MultipartFile file) throws IOException {
    List<LogisticsRecordRequest> requests = file.getOriginalFilename() != null && file.getOriginalFilename().toLowerCase(Locale.ROOT).endsWith(".csv")
            ? parseCsv(file.getBytes())
            : parseExcel(file.getInputStream());

    long imported = 0;
    long skipped = 0;

    for (LogisticsRecordRequest request : requests) {
        if (request.shipmentNumber() == null || request.shipmentNumber().isBlank()) {
            skipped++;
            continue;
        }
        recordService.createRecord(context, organizationId, request);
        imported++;
    }

    return new ImportResultResponse(imported, skipped);
}
```

### Рисунок 2.35 – Фрагменткода экспорта отчетов

### [Скрин кода](./img_6.png)

```java
public ExportFileResponse exportRecords(ActorContext context, Long organizationId, String format) {
    List<LogisticsRecordResponse> records = recordService.listRecordResponses(context, organizationId);
    Organization organization = store.getOrganization(organizationId);
    String organizationName = organization == null ? "organization-" + organizationId : organization.getName();
    String normalizedFormat = format == null ? "xlsx" : format.trim().toLowerCase();
    return switch (normalizedFormat) {
        case "pdf" -> new ExportFileResponse(
                exportPdf(records, organizationId, organizationName),
                buildFilename(organizationName, "pdf"),
                MediaType.APPLICATION_PDF);
        case "xlsx", "excel", "xls" -> new ExportFileResponse(
                exportXlsx(records),
                buildFilename(organizationName, "xlsx"),
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        default -> new ExportFileResponse(
                exportXlsx(records),
                buildFilename(organizationName, "xlsx"),
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    };
}
```

### Рисунок 2.36 – Фрагменткода истории действий и отката изменений

### [Скрин кода](./img_7.png)

```java
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
```

### Рисунок 2.37 – Фрагменткода получения дашборда организации

### [Скрин кода](./img_8.png)

```java
@GetMapping
public DashboardResponse getDashboard(@RequestHeader(value = "Authorization", required = false) String authorization,
                                     @PathVariable Long organizationId) {
    ActorContext context = authService.requireContext(authorization);
    var organizationResponse = organizationService.getOrganizationResponse(context, organizationId);
    var records = recordService.listRecordResponses(context, organizationId);
    return mapperService.toDashboardResponse(organizationResponse, records);
}
```

### Листинг кода программного продукта страниц на 3-4.

```java
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
    actionHistoryService.recordCreated(context, record);
    return record;
}

@Transactional
public LogisticsRecord updateRecord(ActorContext context, Long organizationId, Long recordId, LogisticsRecordRequest request) {
    accessService.requireOrganizationWrite(context, organizationId);
    LogisticsRecord record = store.getRecord(recordId);
    if (record == null || !organizationId.equals(record.getOrganizationId())) {
        throw new ResponseStatusException(NOT_FOUND, "Запись не найдена");
    }
    LogisticsRecord before = snapshot(record);
    apply(record, request);
    LogisticsRecord updated = store.saveRecord(record);
    actionHistoryService.recordUpdated(context, before, updated);
    return updated;
}

@Transactional
public void deleteRecord(ActorContext context, Long organizationId, Long recordId) {
    accessService.requireOrganizationWrite(context, organizationId);
    LogisticsRecord record = store.getRecord(recordId);
    if (record == null || !organizationId.equals(record.getOrganizationId())) {
        throw new ResponseStatusException(NOT_FOUND, "Запись не найдена");
    }
    LogisticsRecord before = snapshot(record);
    store.deleteRecord(recordId);
    actionHistoryService.recordDeleted(context, before);
}

private void apply(LogisticsRecord record, LogisticsRecordRequest request) {
    record.setShipmentNumber(request.shipmentNumber());
    record.setRouteFrom(request.routeFrom());
    record.setRouteFromLatitude(request.routeFromLatitude());
    record.setRouteFromLongitude(request.routeFromLongitude());
    record.setRouteTo(request.routeTo());
    record.setRouteToLatitude(request.routeToLatitude());
    record.setRouteToLongitude(request.routeToLongitude());
    record.setShippedAt(request.shippedAt());
    record.setPlannedDeliveryDate(request.plannedDeliveryDate());
    record.setWeight(request.weight());
    record.setCost(request.cost());
    record.setDeliveredAt(request.deliveredAt());
    record.setStatus(request.status());
    record.setResponsibleDepartment(request.responsibleDepartment());
    record.setNote(request.note());
}

public ImportResultResponse importFile(ActorContext context, Long organizationId, MultipartFile file) throws IOException {
    List<LogisticsRecordRequest> requests = file.getOriginalFilename() != null && file.getOriginalFilename().toLowerCase(Locale.ROOT).endsWith(".csv")
            ? parseCsv(file.getBytes())
            : parseExcel(file.getInputStream());

    long imported = 0;
    long skipped = 0;

    for (LogisticsRecordRequest request : requests) {
        if (request.shipmentNumber() == null || request.shipmentNumber().isBlank()) {
            skipped++;
            continue;
        }
        recordService.createRecord(context, organizationId, request);
        imported++;
    }

    return new ImportResultResponse(imported, skipped);
}

private List<LogisticsRecordRequest> parseCsv(byte[] content) {
    String text = new String(content, StandardCharsets.UTF_8);
    String[] lines = text.split("\\R");
    if (lines.length < 2) {
        return List.of();
    }

    String[] headers = splitLine(lines[0]);
    List<LogisticsRecordRequest> requests = new ArrayList<>();
    for (int i = 1; i < lines.length; i++) {
        if (lines[i].isBlank()) {
            continue;
        }
        requests.add(mapRow(headers, splitLine(lines[i])));
    }
    return requests;
}

public ExportFileResponse exportRecords(ActorContext context, Long organizationId, String format) {
    List<LogisticsRecordResponse> records = recordService.listRecordResponses(context, organizationId);
    Organization organization = store.getOrganization(organizationId);
    String organizationName = organization == null ? "organization-" + organizationId : organization.getName();
    String normalizedFormat = format == null ? "xlsx" : format.trim().toLowerCase();
    return switch (normalizedFormat) {
        case "pdf" -> new ExportFileResponse(
                exportPdf(records, organizationId, organizationName),
                buildFilename(organizationName, "pdf"),
                MediaType.APPLICATION_PDF);
        case "xlsx", "excel", "xls" -> new ExportFileResponse(
                exportXlsx(records),
                buildFilename(organizationName, "xlsx"),
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        default -> new ExportFileResponse(
                exportXlsx(records),
                buildFilename(organizationName, "xlsx"),
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    };
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

@GetMapping
public DashboardResponse getDashboard(@RequestHeader(value = "Authorization", required = false) String authorization,
                                     @PathVariable Long organizationId) {
    ActorContext context = authService.requireContext(authorization);
    var organizationResponse = organizationService.getOrganizationResponse(context, organizationId);
    var records = recordService.listRecordResponses(context, organizationId);
    return mapperService.toDashboardResponse(organizationResponse, records);
}
```
