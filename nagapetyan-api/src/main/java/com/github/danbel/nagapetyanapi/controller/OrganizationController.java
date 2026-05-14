package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.OrganizationCreateRequest;
import com.github.danbel.nagapetyanapi.dto.OrganizationRequest;
import com.github.danbel.nagapetyanapi.dto.OrganizationResponse;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.service.AuthService;
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
    private final AuthService authService;

    public OrganizationController(OrganizationService organizationService, AuthService authService) {
        this.organizationService = organizationService;
        this.authService = authService;
    }

    @GetMapping
    public List<OrganizationResponse> list(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return organizationService.listOrganizationResponses(authService.requireContext(authorization));
    }

    @GetMapping("/{organizationId}")
    public OrganizationResponse get(@RequestHeader(value = "Authorization", required = false) String authorization,
                                    @PathVariable Long organizationId) {
        ActorContext context = authService.requireContext(authorization);
        return organizationService.getOrganizationResponse(context, organizationId);
    }

    @PostMapping
    public OrganizationResponse create(@RequestHeader(value = "Authorization", required = false) String authorization,
                                       @Valid @RequestBody OrganizationCreateRequest request) {
        return organizationService.createOrganizationResponse(authService.requireContext(authorization), request);
    }

    @PutMapping("/{organizationId}")
    public OrganizationResponse update(@RequestHeader(value = "Authorization", required = false) String authorization,
                                       @PathVariable Long organizationId,
                                       @Valid @RequestBody OrganizationRequest request) {
        return organizationService.updateOrganizationResponse(authService.requireContext(authorization), organizationId, request);
    }

    @DeleteMapping("/{organizationId}")
    public void delete(@RequestHeader(value = "Authorization", required = false) String authorization,
                       @PathVariable Long organizationId) {
        organizationService.deleteOrganization(authService.requireContext(authorization), organizationId);
    }
}
