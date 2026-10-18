package org.acme.exeptions.mappers;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import jakarta.json.bind.JsonbException;

@Provider
public class JsonExceptionMapper implements ExceptionMapper<JsonbException> {
    @Override
    public Response toResponse(JsonbException exception) {
        // Check if the exception is caused by an invalid enum value
        String message = exception.getMessage();
        if (message != null && message.contains("cannot deserialize")) {
            message = "Invalid value provided for an enum field";
        }

        JsonObject json = Json.createObjectBuilder()
                .add("error", message)
                .build();

        return Response.status(Response.Status.BAD_REQUEST)
                .type(MediaType.APPLICATION_JSON)
                .entity(json)
                .build();
    }
}
