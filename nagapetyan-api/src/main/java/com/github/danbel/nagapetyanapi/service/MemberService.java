package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.MemberRequest;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.model.Organization;
import com.github.danbel.nagapetyanapi.model.OrganizationMember;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MemberService {

    private final InMemoryStore store;
    private final AccessService accessService;
    private final AuthService authService;
    private final MapperService mapperService;

    public MemberService(InMemoryStore store, AccessService accessService, AuthService authService, MapperService mapperService) {
        this.store = store;
        this.accessService = accessService;
        this.authService = authService;
        this.mapperService = mapperService;
    }

    public List<OrganizationMember> listMembers(ActorContext context, Long organizationId) {
        accessService.requireOrganizationRead(context, organizationId);
        return store.getMembersByOrganization(organizationId);
    }

    public OrganizationMember createMember(ActorContext context, Long organizationId, MemberRequest request) {
        accessService.requireOrganizationWrite(context, organizationId);
        Organization organization = store.getOrganization(organizationId);
        if (organization == null) {
            throw new ResponseStatusException(NOT_FOUND, "Организация не найдена");
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Пароль обязателен");
        }
        if (store.findAccountByLogin(request.login()) != null) {
            throw new ResponseStatusException(BAD_REQUEST, "Логин уже занят");
        }
        OrganizationMember member = new OrganizationMember();
        member.setOrganizationId(organizationId);
        member.setLogin(request.login());
        member.setPasswordHash(authService.hashPassword(request.password()));
        member.setFullName(request.fullName());
        member.setEmail(request.email());
        member.setPosition(request.position());
        member.setRole(request.role());
        return store.saveMember(member);
    }

    public OrganizationMember updateMember(ActorContext context, Long organizationId, Long memberId, MemberRequest request) {
        accessService.requireOrganizationWrite(context, organizationId);
        OrganizationMember member = accessService.requireMember(memberId);
        if (!organizationId.equals(member.getOrganizationId())) {
            throw new ResponseStatusException(NOT_FOUND, "Сотрудник не найден в организации");
        }
        if (!request.login().equals(member.getLogin()) && store.findAccountByLogin(request.login()) != null) {
            throw new ResponseStatusException(BAD_REQUEST, "Логин уже занят");
        }
        member.setLogin(request.login());
        authService.ensurePasswordMatches(member, request.password());
        member.setFullName(request.fullName());
        member.setEmail(request.email());
        member.setPosition(request.position());
        member.setRole(request.role());
        return store.saveMember(member);
    }

    public void deleteMember(ActorContext context, Long organizationId, Long memberId) {
        accessService.requireOrganizationWrite(context, organizationId);
        OrganizationMember member = accessService.requireMember(memberId);
        if (!organizationId.equals(member.getOrganizationId())) {
            throw new ResponseStatusException(NOT_FOUND, "Сотрудник не найден в организации");
        }
        store.deleteSessionsByLoginAndOrganizationId(member.getLogin(), member.getOrganizationId());
        store.deleteMember(memberId);
    }

    public List<com.github.danbel.nagapetyanapi.dto.MemberResponse> listMemberResponses(ActorContext context, Long organizationId) {
        return listMembers(context, organizationId).stream()
                .map(mapperService::toMemberResponse)
                .toList();
    }

    public com.github.danbel.nagapetyanapi.dto.MemberResponse getMemberResponse(ActorContext context, Long organizationId, Long memberId) {
        accessService.requireOrganizationRead(context, organizationId);
        OrganizationMember member = accessService.requireMember(memberId);
        if (!organizationId.equals(member.getOrganizationId())) {
            throw new ResponseStatusException(NOT_FOUND, "Сотрудник не найден в организации");
        }
        return mapperService.toMemberResponse(member);
    }

    public com.github.danbel.nagapetyanapi.dto.MemberResponse createMemberResponse(ActorContext context, Long organizationId, MemberRequest request) {
        return mapperService.toMemberResponse(createMember(context, organizationId, request));
    }

    public com.github.danbel.nagapetyanapi.dto.MemberResponse updateMemberResponse(ActorContext context, Long organizationId, Long memberId, MemberRequest request) {
        return mapperService.toMemberResponse(updateMember(context, organizationId, memberId, request));
    }
}
