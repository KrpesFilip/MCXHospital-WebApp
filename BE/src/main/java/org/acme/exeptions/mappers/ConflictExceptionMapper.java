package org.acme.exeptions.mappers;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.Map;
import org.acme.exeptions.ConflictException;

@Provider
public class ConflictExceptionMapper
        implements ExceptionMapper<ConflictException> {
    @Override
    public Response toResponse(ConflictException e) {
        return Response.status(Response.Status.CONFLICT)
                .entity(Map.of(
                        "error", e.getMessage(),
                        "status", 409
                ))
                .build();
    }
}
