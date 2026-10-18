package org.acme.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.validation.ValidationException;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class PasswordService {
    private static final int COST = 12;


    public String hash(String plainPassword) {
        validatePassword(plainPassword);
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(COST));
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new ValidationException("Password must not be empty");
        }

        if (password.length() < 8) {
            throw new ValidationException("Password must be at least 8 characters");
        }

        if (!password.matches(".*[A-Z].*")) {
            throw new ValidationException("Password must contain an uppercase letter");
        }

        if (!password.matches(".*\\d.*")) {
            throw new ValidationException("Password must contain a number");
        }

        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            throw new ValidationException("Password must contain a special character");
        }
    }

}
