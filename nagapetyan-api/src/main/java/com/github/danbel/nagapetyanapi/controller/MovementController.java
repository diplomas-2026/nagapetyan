package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.LogisticsRecordMovementRequest;
import com.github.danbel.nagapetyanapi.dto.LogisticsRecordMovementResponse;
import com.github.danbel.nagapetyanapi.service.AuthService;
import com.github.danbel.nagapetyanapi.service.MovementService;
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
@RequestMapping("/organizations/{organizationId}/reports/{recordId}/movements")
public class MovementController {

    private final MovementService movementService;
    private final AuthService authService;

    public MovementController(MovementService movementService, AuthService authService) {
        this.movementService = movementService;
        this.authService = authService;
    }

    @GetMapping
    public List<LogisticsRecordMovementResponse> list(@RequestHeader(value = "Authorization", required = false) String authorization,
                                                      @PathVariable Long organizationId,
                                                      @PathVariable Long recordId) {
        return movementService.listMovements(authService.requireContext(authorization), organizationId, recordId)
                .stream()
                .map(movementService::toResponse)
                .toList();
    }

    @GetMapping("/{movementId}")
    public LogisticsRecordMovementResponse get(@RequestHeader(value = "Authorization", required = false) String authorization,
                                               @PathVariable Long organizationId,
                                               @PathVariable Long recordId,
                                               @PathVariable Long movementId) {
        return movementService.toResponse(movementService.getMovement(authService.requireContext(authorization), organizationId, recordId, movementId));
    }

    @PostMapping
    public LogisticsRecordMovementResponse create(@RequestHeader(value = "Authorization", required = false) String authorization,
                                                  @PathVariable Long organizationId,
                                                  @PathVariable Long recordId,
                                                  @Valid @RequestBody LogisticsRecordMovementRequest request) {
        return movementService.toResponse(movementService.createMovement(authService.requireContext(authorization), organizationId, recordId, request));
    }

    @PutMapping("/{movementId}")
    public LogisticsRecordMovementResponse update(@RequestHeader(value = "Authorization", required = false) String authorization,
                                                  @PathVariable Long organizationId,
                                                  @PathVariable Long recordId,
                                                  @PathVariable Long movementId,
                                                  @Valid @RequestBody LogisticsRecordMovementRequest request) {
        return movementService.toResponse(movementService.updateMovement(authService.requireContext(authorization), organizationId, recordId, movementId, request));
    }

    @DeleteMapping("/{movementId}")
    public void delete(@RequestHeader(value = "Authorization", required = false) String authorization,
                       @PathVariable Long organizationId,
                       @PathVariable Long recordId,
                       @PathVariable Long movementId) {
        movementService.deleteMovement(authService.requireContext(authorization), organizationId, recordId, movementId);
    }
}
