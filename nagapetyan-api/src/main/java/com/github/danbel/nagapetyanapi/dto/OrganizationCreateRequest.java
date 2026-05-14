package com.github.danbel.nagapetyanapi.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrganizationCreateRequest(
        @NotBlank String name,
        String inn,
        String region,
        String description,
        @Valid @NotNull OrganizationOwnerRequest owner
) {
}
