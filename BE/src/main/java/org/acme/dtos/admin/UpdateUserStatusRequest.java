package org.acme.dtos.admin;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull(message = "isEnabled status is required")
        Boolean isEnabled
)
{}
