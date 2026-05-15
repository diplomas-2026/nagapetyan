package com.github.danbel.nagapetyanapi.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public record OrganizationCreateRequest(
        @NotBlank String name,
        String inn,
        String region,
        String description,
        @NotBlank String ownerMode,
        String existingOwnerLogin,
        @Valid OrganizationOwnerRequest owner
) {
}
