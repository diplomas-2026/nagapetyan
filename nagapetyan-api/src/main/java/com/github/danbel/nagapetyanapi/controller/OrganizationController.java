package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.OrganizationRequest;
import com.github.danbel.nagapetyanapi.dto.OrganizationResponse;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.ActorRole;
import com.github.danbel.nagapetyanapi.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    public List<OrganizationResponse> list(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                           @RequestHeader(value = "X-Organization-Id", required = false) Long organizationId) {
        return organizationService.listOrganizationResponses(new ActorContext(role, organizationId));
    }

    @GetMapping("/{organizationId}")
    public OrganizationResponse get(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                    @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                    @PathVariable Long organizationId) {
        return organizationService.getOrganizationResponse(new ActorContext(role, organizationHeaderId), organizationId);
    }

    @PostMapping
    public OrganizationResponse create(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                       @RequestHeader(value = "X-Organization-Id", required = false) Long organizationId,
                                       @Valid @RequestBody OrganizationRequest request) {
        return organizationService.createOrganizationResponse(new ActorContext(role, organizationId), request);
    }

    @PutMapping("/{organizationId}")
    public OrganizationResponse update(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                       @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                       @PathVariable Long organizationId,
                                       @Valid @RequestBody OrganizationRequest request) {
        return organizationService.updateOrganizationResponse(new ActorContext(role, organizationHeaderId), organizationId, request);
    }

    @DeleteMapping("/{organizationId}")
    public void delete(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                       @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                       @PathVariable Long organizationId) {
        organizationService.deleteOrganization(new ActorContext(role, organizationHeaderId), organizationId);
    }
}
