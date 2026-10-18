package org.acme.dtos.admin;
import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
        @NotBlank(message = "New password is required")
        String newPassword
) {}
