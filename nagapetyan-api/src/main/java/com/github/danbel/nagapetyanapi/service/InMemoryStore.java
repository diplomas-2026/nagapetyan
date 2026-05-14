package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import com.github.danbel.nagapetyanapi.model.Organization;
import com.github.danbel.nagapetyanapi.model.OrganizationMember;
import com.github.danbel.nagapetyanapi.model.ReportStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Component
public class InMemoryStore {

    private final JdbcTemplate jdbcTemplate;

    public InMemoryStore(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Organization saveOrganization(Organization organization) {
        if (organization.getId() == null) {
            Long id = insertOrganization(organization);
            organization.setId(id);
        } else {
            updateOrganization(organization);
        }
        return getOrganization(organization.getId());
    }

    public OrganizationMember saveMember(OrganizationMember member) {
        if (member.getId() == null) {
            Long id = insertMember(member);
            member.setId(id);
        } else {
            updateMember(member);
        }
        return getMember(member.getId());
    }

    public LogisticsRecord saveRecord(LogisticsRecord record) {
        if (record.getId() == null) {
            Long id = insertRecord(record);
            record.setId(id);
        } else {
            updateRecord(record);
        }
        return getRecord(record.getId());
    }

    public List<Organization> getOrganizations() {
        return jdbcTemplate.query("""
                        select id, name, inn, region, description, created_at
                        from organizations
                        order by id
                        """,
                (rs, rowNum) -> mapOrganization(rs));
    }

    public Organization getOrganization(Long id) {
        List<Organization> organizations = jdbcTemplate.query("""
                        select id, name, inn, region, description, created_at
                        from organizations
                        where id = ?
                        """,
                (rs, rowNum) -> mapOrganization(rs),
                id);
        return organizations.stream().findFirst().orElse(null);
    }

    public void deleteOrganization(Long id) {
        jdbcTemplate.update("delete from organizations where id = ?", id);
    }

    public List<OrganizationMember> getMembersByOrganization(Long organizationId) {
        return jdbcTemplate.query("""
                        select id, organization_id, full_name, email, position, role, created_at
                        from organization_members
                        where organization_id = ?
                        order by id
                        """,
                (rs, rowNum) -> mapMember(rs),
                organizationId);
    }

    public OrganizationMember getMember(Long id) {
        List<OrganizationMember> members = jdbcTemplate.query("""
                        select id, organization_id, full_name, email, position, role, created_at
                        from organization_members
                        where id = ?
                        """,
                (rs, rowNum) -> mapMember(rs),
                id);
        return members.stream().findFirst().orElse(null);
    }

    public void deleteMember(Long id) {
        jdbcTemplate.update("delete from organization_members where id = ?", id);
    }

    public List<LogisticsRecord> getRecordsByOrganization(Long organizationId) {
        return jdbcTemplate.query("""
                        select id, organization_id, shipment_number, route_from, route_to, shipped_at,
                               planned_delivery_date, delivered_at, status, responsible_department, note, created_at
                        from logistics_records
                        where organization_id = ?
                        order by id
                        """,
                (rs, rowNum) -> mapRecord(rs),
                organizationId);
    }

    public LogisticsRecord getRecord(Long id) {
        List<LogisticsRecord> records = jdbcTemplate.query("""
                        select id, organization_id, shipment_number, route_from, route_to, shipped_at,
                               planned_delivery_date, delivered_at, status, responsible_department, note, created_at
                        from logistics_records
                        where id = ?
                        """,
                (rs, rowNum) -> mapRecord(rs),
                id);
        return records.stream().findFirst().orElse(null);
    }

    public void deleteRecord(Long id) {
        jdbcTemplate.update("delete from logistics_records where id = ?", id);
    }

    private Long insertOrganization(Organization organization) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    insert into organizations (name, inn, region, description)
                    values (?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, organization.getName());
            ps.setString(2, organization.getInn());
            ps.setString(3, organization.getRegion());
            ps.setString(4, organization.getDescription());
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    private void updateOrganization(Organization organization) {
        jdbcTemplate.update("""
                        update organizations
                        set name = ?, inn = ?, region = ?, description = ?
                        where id = ?
                        """,
                organization.getName(),
                organization.getInn(),
                organization.getRegion(),
                organization.getDescription(),
                organization.getId());
    }

    private Long insertMember(OrganizationMember member) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    insert into organization_members (organization_id, full_name, email, position, role)
                    values (?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, member.getOrganizationId());
            ps.setString(2, member.getFullName());
            ps.setString(3, member.getEmail());
            ps.setString(4, member.getPosition());
            ps.setString(5, member.getRole().name());
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    private void updateMember(OrganizationMember member) {
        jdbcTemplate.update("""
                        update organization_members
                        set organization_id = ?, full_name = ?, email = ?, position = ?, role = ?
                        where id = ?
                        """,
                member.getOrganizationId(),
                member.getFullName(),
                member.getEmail(),
                member.getPosition(),
                member.getRole().name(),
                member.getId());
    }

    private Long insertRecord(LogisticsRecord record) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    insert into logistics_records (
                        organization_id, shipment_number, route_from, route_to, shipped_at,
                        planned_delivery_date, delivered_at, status, responsible_department, note
                    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, record.getOrganizationId());
            ps.setString(2, record.getShipmentNumber());
            ps.setString(3, record.getRouteFrom());
            ps.setString(4, record.getRouteTo());
            ps.setDate(5, java.sql.Date.valueOf(record.getShippedAt()));
            ps.setDate(6, java.sql.Date.valueOf(record.getPlannedDeliveryDate()));
            if (record.getDeliveredAt() == null) {
                ps.setNull(7, Types.DATE);
            } else {
                ps.setDate(7, java.sql.Date.valueOf(record.getDeliveredAt()));
            }
            ps.setString(8, record.getStatus().name());
            ps.setString(9, record.getResponsibleDepartment());
            ps.setString(10, record.getNote());
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    private void updateRecord(LogisticsRecord record) {
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    update logistics_records
                    set organization_id = ?, shipment_number = ?, route_from = ?, route_to = ?, shipped_at = ?,
                        planned_delivery_date = ?, delivered_at = ?, status = ?, responsible_department = ?, note = ?
                    where id = ?
                    """);
            ps.setLong(1, record.getOrganizationId());
            ps.setString(2, record.getShipmentNumber());
            ps.setString(3, record.getRouteFrom());
            ps.setString(4, record.getRouteTo());
            ps.setDate(5, java.sql.Date.valueOf(record.getShippedAt()));
            ps.setDate(6, java.sql.Date.valueOf(record.getPlannedDeliveryDate()));
            if (record.getDeliveredAt() == null) {
                ps.setNull(7, Types.DATE);
            } else {
                ps.setDate(7, java.sql.Date.valueOf(record.getDeliveredAt()));
            }
            ps.setString(8, record.getStatus().name());
            ps.setString(9, record.getResponsibleDepartment());
            ps.setString(10, record.getNote());
            ps.setLong(11, record.getId());
            return ps;
        });
    }

    private Organization mapOrganization(java.sql.ResultSet rs) throws java.sql.SQLException {
        Organization organization = new Organization();
        organization.setId(rs.getLong("id"));
        organization.setName(rs.getString("name"));
        organization.setInn(rs.getString("inn"));
        organization.setRegion(rs.getString("region"));
        organization.setDescription(rs.getString("description"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        organization.setCreatedAt(createdAt == null ? null : createdAt.toInstant());
        return organization;
    }

    private OrganizationMember mapMember(java.sql.ResultSet rs) throws java.sql.SQLException {
        OrganizationMember member = new OrganizationMember();
        member.setId(rs.getLong("id"));
        member.setOrganizationId(rs.getLong("organization_id"));
        member.setFullName(rs.getString("full_name"));
        member.setEmail(rs.getString("email"));
        member.setPosition(rs.getString("position"));
        member.setRole(ActorRole.valueOf(rs.getString("role")));
        Timestamp createdAt = rs.getTimestamp("created_at");
        member.setCreatedAt(createdAt == null ? null : createdAt.toInstant());
        return member;
    }

    private LogisticsRecord mapRecord(java.sql.ResultSet rs) throws java.sql.SQLException {
        LogisticsRecord record = new LogisticsRecord();
        record.setId(rs.getLong("id"));
        record.setOrganizationId(rs.getLong("organization_id"));
        record.setShipmentNumber(rs.getString("shipment_number"));
        record.setRouteFrom(rs.getString("route_from"));
        record.setRouteTo(rs.getString("route_to"));
        java.sql.Date shippedAt = rs.getDate("shipped_at");
        java.sql.Date plannedDeliveryDate = rs.getDate("planned_delivery_date");
        java.sql.Date deliveredAt = rs.getDate("delivered_at");
        record.setShippedAt(shippedAt == null ? null : shippedAt.toLocalDate());
        record.setPlannedDeliveryDate(plannedDeliveryDate == null ? null : plannedDeliveryDate.toLocalDate());
        record.setDeliveredAt(deliveredAt == null ? null : deliveredAt.toLocalDate());
        record.setStatus(ReportStatus.valueOf(rs.getString("status")));
        record.setResponsibleDepartment(rs.getString("responsible_department"));
        record.setNote(rs.getString("note"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        record.setCreatedAt(createdAt == null ? null : createdAt.toInstant());
        return record;
    }
}
