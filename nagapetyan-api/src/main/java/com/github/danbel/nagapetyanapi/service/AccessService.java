package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.model.OrganizationMember;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AccessService {

    private final InMemoryStore store;

    public AccessService(InMemoryStore store) {
        this.store = store;
    }

    public void requireSystemAdmin(ActorContext context) {
        if (context.role() != ActorRole.SYSTEM_ADMIN) {
            throw new ResponseStatusException(FORBIDDEN, "Доступ разрешен только администратору системы");
        }
    }

    public void requireOrganizationRead(ActorContext context, Long organizationId) {
        if (context.role() == ActorRole.SYSTEM_ADMIN) {
            return;
        }
        if (context.organizationId() == null || !context.organizationId().equals(organizationId)) {
            throw new ResponseStatusException(FORBIDDEN, "Нет доступа к организации");
        }
    }

    public void requireOrganizationWrite(ActorContext context, Long organizationId) {
        if (context.role() == ActorRole.SYSTEM_ADMIN) {
            return;
        }
        if (context.role() != ActorRole.OWNER || context.organizationId() == null || !context.organizationId().equals(organizationId)) {
            throw new ResponseStatusException(FORBIDDEN, "Изменение доступно только владельцу организации");
        }
    }

    public OrganizationMember requireMember(Long memberId) {
        OrganizationMember member = store.getMember(memberId);
        if (member == null) {
            throw new ResponseStatusException(NOT_FOUND, "Сотрудник не найден");
        }
        return member;
    }
}
