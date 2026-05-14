package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.DashboardResponse;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.ActorRole;
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

    public DashboardController(OrganizationService organizationService, RecordService recordService, MapperService mapperService) {
        this.organizationService = organizationService;
        this.recordService = recordService;
        this.mapperService = mapperService;
    }

    @GetMapping
    public DashboardResponse getDashboard(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                          @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                          @PathVariable Long organizationId) {
        ActorContext context = new ActorContext(role, organizationHeaderId);
        var organizationResponse = organizationService.getOrganizationResponse(context, organizationId);
        var records = recordService.listRecordResponses(context, organizationId);
        return mapperService.toDashboardResponse(organizationResponse, records);
    }
}
