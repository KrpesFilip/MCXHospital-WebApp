package org.acme.services;

import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.dtos.users.UserLogin;
import org.acme.models.User;

@ApplicationScoped
public class UserService {

    public User login(UserLogin login) {
        User user = User.find("name", login.name() ).firstResult();
        if (user == null) {
            return null;
        }
        
        if (user.getIsEnabled() == null || !user.getIsEnabled()) {
            return null;
        }
        
        String passwordHash = user.getPassword();

        if(!BcryptUtil.matches(login.password(), passwordHash)) {
            return null;
        }
        return user;
    }

    public User getUserDetails(Long id) {
        return User.findById(id);
    }
}
