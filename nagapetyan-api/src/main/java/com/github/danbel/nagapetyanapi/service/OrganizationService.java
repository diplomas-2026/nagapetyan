package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.OrganizationRequest;
import com.github.danbel.nagapetyanapi.dto.OrganizationResponse;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.model.Organization;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class OrganizationService {

    private final InMemoryStore store;
    private final AccessService accessService;
    private final MapperService mapperService;

    public OrganizationService(InMemoryStore store, AccessService accessService, MapperService mapperService) {
        this.store = store;
        this.accessService = accessService;
        this.mapperService = mapperService;
    }

    public List<Organization> listOrganizations(ActorContext context) {
        if (context.role() == ActorRole.SYSTEM_ADMIN) {
            return store.getOrganizations();
        }
        if (context.organizationId() == null) {
            return List.of();
        }
        Organization organization = store.getOrganization(context.organizationId());
        return organization == null ? List.of() : List.of(organization);
    }

    public Organization getOrganization(ActorContext context, Long organizationId) {
        accessService.requireOrganizationRead(context, organizationId);
        Organization organization = store.getOrganization(organizationId);
        if (organization == null) {
            throw new ResponseStatusException(NOT_FOUND, "Организация не найдена");
        }
        return organization;
    }

    public Organization createOrganization(ActorContext context, OrganizationRequest request) {
        accessService.requireSystemAdmin(context);
        Organization organization = new Organization();
        organization.setName(request.name());
        organization.setInn(request.inn());
        organization.setRegion(request.region());
        organization.setDescription(request.description());
        return store.saveOrganization(organization);
    }

    public Organization updateOrganization(ActorContext context, Long organizationId, OrganizationRequest request) {
        accessService.requireSystemAdmin(context);
        Organization organization = store.getOrganization(organizationId);
        if (organization == null) {
            throw new ResponseStatusException(NOT_FOUND, "Организация не найдена");
        }
        organization.setName(request.name());
        organization.setInn(request.inn());
        organization.setRegion(request.region());
        organization.setDescription(request.description());
        return store.saveOrganization(organization);
    }

    public void deleteOrganization(ActorContext context, Long organizationId) {
        accessService.requireSystemAdmin(context);
        if (store.getOrganization(organizationId) == null) {
            throw new ResponseStatusException(NOT_FOUND, "Организация не найдена");
        }
        store.deleteOrganization(organizationId);
    }

    public List<OrganizationResponse> listOrganizationResponses(ActorContext context) {
        return listOrganizations(context).stream()
                .map(organization -> mapperService.toOrganizationResponse(
                        organization,
                        store.getMembersByOrganization(organization.getId()).stream().filter(member -> member.getRole() == ActorRole.OWNER).count(),
                        store.getMembersByOrganization(organization.getId()).stream().filter(member -> member.getRole() == ActorRole.EMPLOYEE).count(),
                        store.getRecordsByOrganization(organization.getId()).size()))
                .toList();
    }

    public OrganizationResponse getOrganizationResponse(ActorContext context, Long organizationId) {
        Organization organization = getOrganization(context, organizationId);
        return mapperService.toOrganizationResponse(
                organization,
                store.getMembersByOrganization(organization.getId()).stream().filter(member -> member.getRole() == ActorRole.OWNER).count(),
                store.getMembersByOrganization(organization.getId()).stream().filter(member -> member.getRole() == ActorRole.EMPLOYEE).count(),
                store.getRecordsByOrganization(organization.getId()).size());
    }

    public OrganizationResponse createOrganizationResponse(ActorContext context, OrganizationRequest request) {
        Organization organization = createOrganization(context, request);
        return mapperService.toOrganizationResponse(organization, 0, 0, 0);
    }

    public OrganizationResponse updateOrganizationResponse(ActorContext context, Long organizationId, OrganizationRequest request) {
        Organization organization = updateOrganization(context, organizationId, request);
        return mapperService.toOrganizationResponse(
                organization,
                store.getMembersByOrganization(organization.getId()).stream().filter(member -> member.getRole() == ActorRole.OWNER).count(),
                store.getMembersByOrganization(organization.getId()).stream().filter(member -> member.getRole() == ActorRole.EMPLOYEE).count(),
                store.getRecordsByOrganization(organization.getId()).size());
    }
}
