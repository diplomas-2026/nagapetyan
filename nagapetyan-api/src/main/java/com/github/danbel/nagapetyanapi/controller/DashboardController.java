package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.DashboardResponse;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.service.AuthService;
import com.github.danbel.nagapetyanapi.service.MapperService;
import com.github.danbel.nagapetyanapi.service.OrganizationService;
import com.github.danbel.nagapetyanapi.service.RecordService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/organizations/{organizationId}/dashboard")
public class DashboardController {

    private final OrganizationService organizationService;
    private final RecordService recordService;
    private final MapperService mapperService;
    private final AuthService authService;

    public DashboardController(OrganizationService organizationService, RecordService recordService, MapperService mapperService, AuthService authService) {
        this.organizationService = organizationService;
        this.recordService = recordService;
        this.mapperService = mapperService;
        this.authService = authService;
    }

    @GetMapping
    public DashboardResponse getDashboard(@RequestHeader(value = "Authorization", required = false) String authorization,
                                         @PathVariable Long organizationId) {
        ActorContext context = authService.requireContext(authorization);
        var organizationResponse = organizationService.getOrganizationResponse(context, organizationId);
        var records = recordService.listRecordResponses(context, organizationId);
        return mapperService.toDashboardResponse(organizationResponse, records);
    }
}
