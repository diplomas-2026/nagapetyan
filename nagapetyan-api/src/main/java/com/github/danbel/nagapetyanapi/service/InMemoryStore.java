package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.model.AuthAccount;
import com.github.danbel.nagapetyanapi.model.AuthSession;
import com.github.danbel.nagapetyanapi.model.AuthSessionEntity;
import com.github.danbel.nagapetyanapi.model.LogisticsRecord;
import com.github.danbel.nagapetyanapi.model.Organization;
import com.github.danbel.nagapetyanapi.model.OrganizationMember;
import com.github.danbel.nagapetyanapi.model.ReportStatus;
import com.github.danbel.nagapetyanapi.model.SystemAdmin;
import com.github.danbel.nagapetyanapi.repository.AuthSessionRepository;
import com.github.danbel.nagapetyanapi.repository.LogisticsRecordRepository;
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
    private final SystemAdminRepository systemAdminRepository;
    private final AuthSessionRepository authSessionRepository;

    public InMemoryStore(
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository memberRepository,
            LogisticsRecordRepository recordRepository,
            SystemAdminRepository systemAdminRepository,
            AuthSessionRepository authSessionRepository) {
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
        this.recordRepository = recordRepository;
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

    public AuthAccount findAccountByLogin(String login) {
        try {
            SystemAdmin admin = systemAdminRepository.findByLogin(login).orElse(null);
            if (admin != null) {
                return new AuthAccount(
                        ActorRole.SYSTEM_ADMIN,
                        null,
                        admin.getLogin(),
                        admin.getFullName(),
                        admin.getPasswordHash());
            }
        } catch (DataAccessException exception) {
            if ("admin".equals(login)) {
                return new AuthAccount(
                        ActorRole.SYSTEM_ADMIN,
                        null,
                        "admin",
                        "Системный администратор",
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
        authSessionRepository.save(entity);
    }

    public void deleteSession(String token) {
        authSessionRepository.deleteById(token);
    }

    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }

    public List<LogisticsRecord> getRecordsByOrganization(Long organizationId) {
        return recordRepository.findByOrganizationIdOrderByIdAsc(organizationId);
    }

    public LogisticsRecord getRecord(Long id) {
        return recordRepository.findById(id).orElse(null);
    }

    public void deleteRecord(Long id) {
        recordRepository.deleteById(id);
    }
}
