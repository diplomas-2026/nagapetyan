package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.MemberResponse;
import com.github.danbel.nagapetyanapi.dto.OwnerRegistrationRequest;
import com.github.danbel.nagapetyanapi.dto.OrganizationResponse;
import com.github.danbel.nagapetyanapi.dto.RegistrationResponse;
import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.model.Organization;
import com.github.danbel.nagapetyanapi.model.OrganizationMember;
import org.springframework.stereotype.Service;

@Service
public class RegistrationService {

    private final InMemoryStore store;
    private final MapperService mapperService;

    public RegistrationService(InMemoryStore store, MapperService mapperService) {
        this.store = store;
        this.mapperService = mapperService;
    }

    public RegistrationResponse registerOwner(OwnerRegistrationRequest request) {
        Organization organization = new Organization();
        organization.setName(request.organizationName());
        organization.setInn(request.inn());
        organization.setRegion(request.region());
        organization.setDescription(request.description());
        organization = store.saveOrganization(organization);

        OrganizationMember owner = new OrganizationMember();
        owner.setOrganizationId(organization.getId());
        owner.setFullName(request.fullName());
        owner.setEmail(request.email());
        owner.setPosition(request.position() == null || request.position().isBlank()
                ? "Владелец организации"
                : request.position());
        owner.setRole(ActorRole.OWNER);
        owner = store.saveMember(owner);

        OrganizationResponse organizationResponse = mapperService.toOrganizationResponse(organization, 1, 0, 0);
        MemberResponse ownerResponse = mapperService.toMemberResponse(owner);
        return new RegistrationResponse(organizationResponse, ownerResponse);
    }
}
