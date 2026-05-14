package com.github.danbel.nagapetyanapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OrganizationOwnerRequest(
        @NotBlank String login,
        @NotBlank String password,
        @NotBlank String fullName,
        @Email String email,
        String position
) {
}
