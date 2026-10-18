package org.acme.exeptions.mappers;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.Map;
import org.acme.exeptions.NotFoundException;

@Provider
public class NotFoundExceptionMapper
        implements ExceptionMapper<NotFoundException> {
    @Override
    public Response toResponse(NotFoundException e) {
        return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of(
                        "error", e.getMessage(),
                        "status", 404
                ))
                .build();
    }
}
