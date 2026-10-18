package org.acme.resources;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dtos.messages.MessageRequest;
import org.acme.dtos.messages.MessageResponse;
import org.acme.models.Message;
import org.acme.services.MessageService;

import java.util.List;

@Path("/messages")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MessageResource {

    @Inject
    MessageService messageService;

    @GET
    @Path("/case/{caseId}")
    @PermitAll
    public Response getMessages(@PathParam("caseId") String caseId) {
        List<Message> messages = messageService.getMessagesByCase(Long.parseLong(caseId));
        List<MessageResponse> responses = messages.stream()
                .map(msg -> new MessageResponse(
                        msg.id,
                        msg.getCaseEntity().id,
                        msg.getSender().id,
                        msg.getSender().getName(),
                        msg.getContent(),
                        msg.getCreatedAt()
                ))
                .toList();
        return Response.ok(responses).build();
    }

    @POST
    @Path("/case/save")
    @PermitAll
    public Response saveMessage(MessageRequest request) {
        Message savedMessage = messageService.saveMessage(request);

        MessageResponse response = new MessageResponse(
                savedMessage.id,
                savedMessage.getCaseEntity().id,
                savedMessage.getSender().id,
                savedMessage.getSender().getName(),
                savedMessage.getContent(),
                savedMessage.getCreatedAt()
        );

        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
