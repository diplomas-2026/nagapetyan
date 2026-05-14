package com.github.danbel.nagapetyanapi.dto;

public record RegistrationResponse(
        OrganizationResponse organization,
        MemberResponse owner
) {
}
