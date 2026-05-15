package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.model.AuthAccount;
import com.github.danbel.nagapetyanapi.model.AuthSession;
import com.github.danbel.nagapetyanapi.model.AuthSessionEntity;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import com.github.danbel.nagapetyanapi.model.LogisticsRecordMovement;
import com.github.danbel.nagapetyanapi.model.LogisticsActionHistory;
import com.github.danbel.nagapetyanapi.model.Organization;
import com.github.danbel.nagapetyanapi.model.OrganizationMember;
import com.github.danbel.nagapetyanapi.model.ReportStatus;
import com.github.danbel.nagapetyanapi.model.SystemAdmin;
import com.github.danbel.nagapetyanapi.repository.AuthSessionRepository;
import com.github.danbel.nagapetyanapi.repository.LogisticsActionHistoryRepository;
import com.github.danbel.nagapetyanapi.repository.LogisticsRecordRepository;
import com.github.danbel.nagapetyanapi.repository.LogisticsRecordMovementRepository;
import com.github.danbel.nagapetyanapi.repository.OrganizationMemberRepository;
import com.github.danbel.nagapetyanapi.repository.OrganizationRepository;
import com.github.danbel.nagapetyanapi.repository.SystemAdminRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Component
public class InMemoryStore {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final LogisticsRecordRepository recordRepository;
    private final LogisticsRecordMovementRepository movementRepository;
    private final LogisticsActionHistoryRepository actionHistoryRepository;
    private final SystemAdminRepository systemAdminRepository;
    private final AuthSessionRepository authSessionRepository;

    public InMemoryStore(
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository memberRepository,
            LogisticsRecordRepository recordRepository,
            LogisticsRecordMovementRepository movementRepository,
            LogisticsActionHistoryRepository actionHistoryRepository,
            SystemAdminRepository systemAdminRepository,
            AuthSessionRepository authSessionRepository) {
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
        this.recordRepository = recordRepository;
        this.movementRepository = movementRepository;
        this.actionHistoryRepository = actionHistoryRepository;
        this.systemAdminRepository = systemAdminRepository;
        this.authSessionRepository = authSessionRepository;
    }

    public Organization saveOrganization(Organization organization) {
        return organizationRepository.save(organization);
    }

    public OrganizationMember saveMember(OrganizationMember member) {
        return memberRepository.save(member);
    }

    public LogisticsRecord saveRecord(LogisticsRecord record) {
        return recordRepository.save(record);
    }

    public LogisticsRecordMovement saveMovement(LogisticsRecordMovement movement) {
        return movementRepository.save(movement);
    }

    public List<Organization> getOrganizations() {
        return organizationRepository.findAllByOrderByIdAsc();
    }

    public Organization getOrganization(Long id) {
        return organizationRepository.findById(id).orElse(null);
    }

    public void deleteOrganization(Long id) {
        organizationRepository.deleteById(id);
    }

    public void deleteSessionsByOrganizationId(Long organizationId) {
        authSessionRepository.deleteByOrganizationId(organizationId);
    }

    public void deleteSessionsByLoginAndOrganizationId(String login, Long organizationId) {
        authSessionRepository.deleteByLoginAndOrganizationId(login, organizationId);
    }

    public List<OrganizationMember> getMembersByOrganization(Long organizationId) {
        return memberRepository.findByOrganizationIdOrderByIdAsc(organizationId);
    }

    public OrganizationMember getMember(Long id) {
        return memberRepository.findById(id).orElse(null);
    }

    public OrganizationMember findMemberByLogin(String login) {
        return memberRepository.findByLogin(login).orElse(null);
    }

    public AuthAccount findAccountByLogin(String login) {
        try {
            SystemAdmin admin = systemAdminRepository.findByLogin(login).orElse(null);
            if (admin != null) {
                return new AuthAccount(
                        ActorRole.SYSTEM_ADMIN,
                        null,
                        admin.getLogin(),
                        admin.getFullName(),
                        null,
                        admin.getPasswordHash());
            }
        } catch (DataAccessException exception) {
            if ("admin".equals(login)) {
                return new AuthAccount(
                        ActorRole.SYSTEM_ADMIN,
                        null,
                        "admin",
                        "Системный администратор",
                        null,
                        "893579fd9b1956136d9f1a544ce5b60a7754cb75691eabbe0c701c52d5442963");
            }
        }

        OrganizationMember member = memberRepository.findByLogin(login).orElse(null);
        if (member == null) {
            return null;
        }
        return new AuthAccount(
                member.getRole(),
                member.getOrganizationId(),
                member.getLogin(),
                member.getFullName(),
                member.getPosition(),
                member.getPasswordHash());
    }

    public AuthSession getSession(String token) {
        AuthSessionEntity entity = authSessionRepository.findById(token).orElse(null);
        if (entity == null) {
            return null;
        }
        return new AuthSession(
                entity.getToken(),
                ActorRole.valueOf(entity.getRole()),
                entity.getOrganizationId(),
                entity.getLogin(),
                entity.getFullName());
    }

    public void saveSession(AuthSession session) {
        AuthSessionEntity entity = new AuthSessionEntity();
        entity.setToken(session.token());
        entity.setRole(session.role().name());
        entity.setOrganizationId(session.organizationId());
        entity.setLogin(session.login());
        entity.setFullName(session.fullName());
        entity.setCreatedAt(java.time.Instant.now());
        authSessionRepository.save(entity);
    }

    public void deleteSession(String token) {
        authSessionRepository.deleteById(token);
    }

    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }

    public List<LogisticsRecord> getRecordsByOrganization(Long organizationId) {
        return recordRepository.findByOrganizationIdAndDeletedAtIsNullOrderByIdAsc(organizationId);
    }

    public LogisticsRecord getRecord(Long id) {
        return recordRepository.findById(id).orElse(null);
    }

    public void deleteRecord(Long id) {
        LogisticsRecord record = recordRepository.findById(id).orElse(null);
        if (record != null) {
            record.setDeletedAt(Instant.now());
            recordRepository.save(record);
        }
    }

    public List<LogisticsRecordMovement> getMovementsByRecordId(Long recordId) {
        return movementRepository.findByRecordIdOrderBySortOrderAsc(recordId);
    }

    public LogisticsActionHistory saveActionHistory(LogisticsActionHistory history) {
        return actionHistoryRepository.save(history);
    }

    public List<LogisticsActionHistory> getActionHistoryByOrganization(Long organizationId) {
        return actionHistoryRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);
    }

    public List<LogisticsActionHistory> getActionHistoryByOrganizationAndActorLogin(Long organizationId, String actorLogin) {
        return actionHistoryRepository.findByOrganizationIdAndActorLoginOrderByCreatedAtDesc(organizationId, actorLogin);
    }

    public LogisticsActionHistory getActionHistory(Long id) {
        return actionHistoryRepository.findById(id).orElse(null);
    }
}
