package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.OwnerRegistrationRequest;
import com.github.danbel.nagapetyanapi.dto.RegistrationResponse;
import com.github.danbel.nagapetyanapi.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final RegistrationService registrationService;

    public AuthController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/register")
    public RegistrationResponse registerOwner(@Valid @RequestBody OwnerRegistrationRequest request) {
        return registrationService.registerOwner(request);
    }
}
