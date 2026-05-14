package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import com.github.danbel.nagapetyanapi.model.Organization;
import com.github.danbel.nagapetyanapi.model.OrganizationMember;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class InMemoryStore {

    private final AtomicLong organizationSequence = new AtomicLong(0);
    private final AtomicLong memberSequence = new AtomicLong(0);
    private final AtomicLong recordSequence = new AtomicLong(0);

    private final Map<Long, Organization> organizations = new LinkedHashMap<>();
    private final Map<Long, OrganizationMember> members = new LinkedHashMap<>();
    private final Map<Long, LogisticsRecord> records = new LinkedHashMap<>();

    public synchronized Organization saveOrganization(Organization organization) {
        if (organization.getId() == null) {
            organization.setId(organizationSequence.incrementAndGet());
            organization.setCreatedAt(Instant.now());
        }
        organizations.put(organization.getId(), organization);
        return organization;
    }

    public synchronized OrganizationMember saveMember(OrganizationMember member) {
        if (member.getId() == null) {
            member.setId(memberSequence.incrementAndGet());
            member.setCreatedAt(Instant.now());
        }
        members.put(member.getId(), member);
        return member;
    }

    public synchronized LogisticsRecord saveRecord(LogisticsRecord record) {
        if (record.getId() == null) {
            record.setId(recordSequence.incrementAndGet());
            record.setCreatedAt(Instant.now());
        }
        records.put(record.getId(), record);
        return record;
    }

    public synchronized List<Organization> getOrganizations() {
        return new ArrayList<>(organizations.values());
    }

    public synchronized Organization getOrganization(Long id) {
        return organizations.get(id);
    }

    public synchronized void deleteOrganization(Long id) {
        organizations.remove(id);
        members.values().removeIf(member -> id.equals(member.getOrganizationId()));
        records.values().removeIf(record -> id.equals(record.getOrganizationId()));
    }

    public synchronized List<OrganizationMember> getMembersByOrganization(Long organizationId) {
        return members.values().stream()
                .filter(member -> organizationId.equals(member.getOrganizationId()))
                .toList();
    }

    public synchronized OrganizationMember getMember(Long id) {
        return members.get(id);
    }

    public synchronized void deleteMember(Long id) {
        members.remove(id);
    }

    public synchronized List<LogisticsRecord> getRecordsByOrganization(Long organizationId) {
        return records.values().stream()
                .filter(record -> organizationId.equals(record.getOrganizationId()))
                .toList();
    }

    public synchronized LogisticsRecord getRecord(Long id) {
        return records.get(id);
    }

    public synchronized void deleteRecord(Long id) {
        records.remove(id);
    }

    public synchronized void seedDemoData() {
        if (!organizations.isEmpty()) {
            return;
        }

        Organization central = new Organization();
        central.setName("АО «Почта России» - Центральный филиал");
        central.setInn("7700000000");
        central.setRegion("Москва");
        central.setDescription("Демонстрационная организация для отчётности по логистике");
        saveOrganization(central);

        Organization north = new Organization();
        north.setName("АО «Почта России» - Северный филиал");
        north.setInn("7800000000");
        north.setRegion("Санкт-Петербург");
        north.setDescription("Вторая тестовая организация для демонстрации ролей");
        saveOrganization(north);

        saveMember(createMember(central.getId(), "Иван Петров", "ivan.petrov@mail.ru", "Руководитель логистики", ActorRole.OWNER));
        saveMember(createMember(central.getId(), "Анна Смирнова", "anna.smirnova@mail.ru", "Аналитик", ActorRole.EMPLOYEE));
        saveMember(createMember(north.getId(), "Олег Иванов", "oleg.ivanov@mail.ru", "Руководитель филиала", ActorRole.OWNER));

        saveRecord(createRecord(central.getId(), "RT-1001", "Москва", "Казань", LocalDate.now().minusDays(5), LocalDate.now().minusDays(2), LocalDate.now().minusDays(2), "Центральный сортировочный центр", "Доставлено без отклонений"));
        saveRecord(createRecord(central.getId(), "RT-1002", "Москва", "Самара", LocalDate.now().minusDays(4), LocalDate.now().minusDays(1), LocalDate.now().plusDays(1), "Центральный сортировочный центр", "Требует контроля"));
        saveRecord(createRecord(central.getId(), "RT-1003", "Москва", "Пермь", LocalDate.now().minusDays(3), LocalDate.now().minusDays(1), null, "Центральный сортировочный центр", "В пути"));
        saveRecord(createRecord(north.getId(), "RT-2001", "Санкт-Петербург", "Вологда", LocalDate.now().minusDays(2), LocalDate.now().minusDays(1), LocalDate.now().minusDays(1), "Северный логистический узел", "Доставлено"));
    }

    private OrganizationMember createMember(Long organizationId, String fullName, String email, String position, ActorRole role) {
        OrganizationMember member = new OrganizationMember();
        member.setOrganizationId(organizationId);
        member.setFullName(fullName);
        member.setEmail(email);
        member.setPosition(position);
        member.setRole(role);
        return member;
    }

    private LogisticsRecord createRecord(Long organizationId, String shipmentNumber, String routeFrom, String routeTo, LocalDate shippedAt, LocalDate plannedDeliveryDate, LocalDate deliveredAt, String responsibleDepartment, String note) {
        LogisticsRecord record = new LogisticsRecord();
        record.setOrganizationId(organizationId);
        record.setShipmentNumber(shipmentNumber);
        record.setRouteFrom(routeFrom);
        record.setRouteTo(routeTo);
        record.setShippedAt(shippedAt);
        record.setPlannedDeliveryDate(plannedDeliveryDate);
        record.setDeliveredAt(deliveredAt);
        record.setResponsibleDepartment(responsibleDepartment);
        record.setNote(note);
        record.setStatus(deliveredAt == null ? com.github.danbel.nagapetyanapi.model.ReportStatus.IN_TRANSIT
                : deliveredAt.isAfter(plannedDeliveryDate)
                ? com.github.danbel.nagapetyanapi.model.ReportStatus.DELAYED
                : com.github.danbel.nagapetyanapi.model.ReportStatus.DELIVERED);
        return record;
    }
}
