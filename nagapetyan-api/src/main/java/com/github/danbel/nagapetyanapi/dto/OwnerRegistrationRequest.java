package com.github.danbel.nagapetyanapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OwnerRegistrationRequest(
        @NotBlank String organizationName,
        String inn,
        String region,
        String description,
        @NotBlank String fullName,
        @Email String email,
        String position
) {
}
