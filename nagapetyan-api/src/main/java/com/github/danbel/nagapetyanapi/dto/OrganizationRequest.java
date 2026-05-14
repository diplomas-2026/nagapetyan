package com.github.danbel.nagapetyanapi.dto;

import jakarta.validation.constraints.NotBlank;

public record OrganizationRequest(
        @NotBlank String name,
        String inn,
        String region,
        String description
) {
}
