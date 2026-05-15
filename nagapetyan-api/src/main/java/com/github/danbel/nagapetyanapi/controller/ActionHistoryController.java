package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.LogisticsActionHistoryResponse;
import com.github.danbel.nagapetyanapi.service.AuthService;
import com.github.danbel.nagapetyanapi.service.LogisticsActionHistoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/organizations/{organizationId}/actions")
public class ActionHistoryController {

    private final LogisticsActionHistoryService historyService;
    private final AuthService authService;

    public ActionHistoryController(LogisticsActionHistoryService historyService, AuthService authService) {
        this.historyService = historyService;
        this.authService = authService;
    }

    @GetMapping
    public List<LogisticsActionHistoryResponse> list(@RequestHeader(value = "Authorization", required = false) String authorization,
                                                     @PathVariable Long organizationId,
                                                     @RequestParam(value = "actorLogin", required = false) String actorLogin) {
        return historyService.listHistory(authService.requireContext(authorization), organizationId, actorLogin);
    }

    @PostMapping("/{historyId}/revert")
    public LogisticsActionHistoryResponse revert(@RequestHeader(value = "Authorization", required = false) String authorization,
                                                 @PathVariable Long organizationId,
                                                 @PathVariable Long historyId) {
        return historyService.revertAction(authService.requireContext(authorization), organizationId, historyId);
    }
}
