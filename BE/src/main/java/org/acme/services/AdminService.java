package org.acme.services;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.acme.dtos.admin.*;
import org.acme.exeptions.ConflictException;
import org.acme.exeptions.NotFoundException;
import org.acme.models.User;
import org.jboss.logging.Logger;

@ApplicationScoped
    public class AdminService {

    private static final Logger LOG = Logger.getLogger(AdminService.class);

    @Inject
    PasswordService passwordService;

    public List<UserResponse> getAllUsers() {
        LOG.info("Fetching all users");
        return User.<User>listAll()
                .stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());

    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        LOG.infof("Attempting to create user with username: %s, role: %s", request.username(), request.role());

        if (User.find("name", request.username()).firstResult() != null) {
            LOG.warnf("Failed to create user: username '%s' already exists", request.username());
            throw new ConflictException("Username already exists");
        }

        User user = new User();
        user.setName(request.username());
        user.setPassword(passwordService.hash(request.password()));
        user.setRole(request.role());
        user.setIsEnabled(true);
        user.setCreatedAt(Instant.now());

        user.persist();
        LOG.infof("User created successfully: id=%d, username=%s, role=%s", user.id, user.getName(), user.getRole());
        return UserResponse.from(user);
    }

    /*
    @Transactional
    public void deleteUser(Long id) {
        LOG.infof("Attempting to delete user with id: %d", id);
        if (!User.deleteById(id)) {
            LOG.warnf("Failed to delete user: user with id %d not found", id);
            throw new NotFoundException("User with id " + id + " not found");

        }
        LOG.infof("User deleted successfully: id=%d", id);
    }
    */

    @Transactional
    public void toggleUserStatus(Long id, UpdateUserStatusRequest request) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User with ID " + id + " not found");
        }
        user.setIsEnabled(request.isEnabled());
        user.setUpdatedAt(Instant.now());
        user.persist();
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        LOG.infof("Attempting to change password for user id: %d", userId);

        User user = User.findById(userId);

        if (user == null) {
            LOG.warnf("Failed to change password: user with id %d not found", userId);
            throw new NotFoundException("User with ID " + userId + " not found");
        }

        user.setPassword(passwordService.hash(request.newPassword()));
        user.setUpdatedAt(Instant.now());
        LOG.infof("Password changed successfully for user id: %d", userId);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        LOG.infof("Attempting to update user id: %d with new username: %s, role: %s", id, request.username(), request.role());
        User user = User.findById(id);
        if (user == null) {
            LOG.warnf("Failed to update user: user with id %d not found", id);
            throw new NotFoundException("User with ID " + id + " not found");
        }
        user.setName(request.username());
        user.setRole(request.role());
        user.setUpdatedAt(Instant.now());

        LOG.infof("User updated successfully: id=%d, username=%s, role=%s", user.id, user.getName(), user.getRole());

        return UserResponse.from(user);
    }




}
