package org.acme.resources;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.annotation.security.RolesAllowed;

import org.acme.dtos.admin.*;
import org.acme.services.AdminService;

import java.util.List;


@Path("/admin/users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")

public class AdminResource {

    @Inject
    AdminService adminService;

    // GET /admin/users
    @GET
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    // POST /admin/users
    @POST
    public Response createUser(@Valid CreateUserRequest request) {

            UserResponse created = adminService.createUser(request);
            return Response.status(Response.Status.CREATED)
                .entity(created)
                .build();

    }

    /*
    // DELETE /admin/users/{id}
    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") Long id) {

            adminService.deleteUser(id);
            return Response.noContent().build();

    }
    */

    // PUT /admin/users/{id}/password
    @PUT
    @Path("/{id}/password")
    public Response changePassword(
            @PathParam("id") Long id,
            @Valid ChangePasswordRequest request
    ) {
            adminService.changePassword(id, request);
            return Response.noContent().build();
    }

    @PUT
    @Path("/{id}")
    public Response updateUser(
            @PathParam("id") Long id,
            @Valid UpdateUserRequest request
    ) {
            UserResponse updated = adminService.updateUser(id, request);
            return Response.ok(updated).build();
    }

    @PUT
    @Path("/{id}/status")
    public Response toggleUserStatus(@PathParam("id") Long id, @Valid UpdateUserStatusRequest request) {
        adminService.toggleUserStatus(id, request);
        return Response.noContent().build();
    }
}
