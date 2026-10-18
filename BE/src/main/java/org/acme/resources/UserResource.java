package org.acme.resources;

import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dtos.users.UserLogin;
import org.acme.models.User;
import org.acme.services.JwtService;
import org.acme.services.UserService;

import java.util.Map;

@Path("/user")
public class UserResource {

    @Inject
    UserService userService;

    @Inject
    JwtService jwtService;

    @POST
    @Path("login/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(UserLogin login) {
        
        User userCheck = User.find("name", login.name()).firstResult();
        if(userCheck != null && (userCheck.getIsEnabled() == null || !userCheck.getIsEnabled())){
            return Response
                    .status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", "Your account is disabled. Contact your system administrator"))
                    .build();
        }
        
        User user = userService.login(login);
        if(user == null){
            return Response
                    .status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", "Invalid credentials"))
                    .build();
        }
        String token = jwtService.generateToken(user);
        return Response.ok(Map.of(
                "token", token
        )).build();
    }

    @POST
    @Path("logout/")
    @PermitAll
    @Produces(MediaType.APPLICATION_JSON)
    public Response logout() {
        return Response.ok(Map.of("message", "Logged out successfully")).build();
    }

    @GET
    @Path("{id}/")
    @RolesAllowed("ADMIN")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserById(@PathParam("id") Long id) {
        User user = userService.getUserDetails(id);;
        if (user == null) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "User not found"))
                    .build();
        }
        return Response.ok(user).build();
    }
}
