package com.github.danbel.nagapetyanapi.dto;

import com.github.danbel.nagapetyanapi.model.ActorRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MemberRequest(
        @NotBlank String fullName,
        @Email String email,
        String position,
        @NotNull ActorRole role
) {
}
