package org.acme.dtos.admin;
import org.acme.enums.Role;

public record UpdateUserRequest(String username, Role role) {
}
