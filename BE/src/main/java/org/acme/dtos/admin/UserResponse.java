package org.acme.dtos.admin;
import org.acme.models.User;
import org.acme.enums.Role;

import java.time.Instant;

public record UserResponse(
        String id,
        String username,
        Role role,
        Boolean isEnabled,
        Instant createdAt,
        Instant updatedAt
) {

    public static UserResponse from(User user) {

        return new UserResponse(
                user.id.toString(),
                user.getName(),
                user.getRole(),
                user.getIsEnabled(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

}
