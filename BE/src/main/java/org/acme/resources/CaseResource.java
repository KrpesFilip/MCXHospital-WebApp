package org.acme.resources;

import com.itextpdf.kernel.pdf.annot.Pdf3DAnnotation;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dtos.cases.*;
import org.acme.models.Case;
import org.acme.services.CaseService;
import org.acme.services.PdfService;
import org.acme.websockets.CaseWebSocketEndpoint;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.stream.Collectors;

@Path("/cases")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CaseResource {

    @Inject
    CaseService caseService;

    @Inject
    CaseWebSocketEndpoint webSocketEndpoint;

    @Inject
    JsonWebToken jwt;

    @Inject
    PdfService pdfService;

    @GET
    //@RolesAllowed({"ADMIN", "HOSPITAL"})
    public Response getAllCases() {
        List<Case> cases = caseService.getAllCases();
        List<CaseResponse> responses = cases.stream()
                .map(CaseResponse::fromEntity)
                .collect(Collectors.toList());
        return Response.ok(responses).build();
    }

    @GET
    @Path("/{id}")
    //@RolesAllowed({"ADMIN", "HOSPITAL"})
    public Response getCaseById(@PathParam("id") Long id) {
        Case caseEntity = caseService.getCaseById(id);
        return Response.ok(CaseResponse.fromEntity(caseEntity)).build();
    }

    @GET
    @Path("/{id}/pdf")
    @Produces("application/pdf")
    public Response getCasePdf(@PathParam("id") Long id) {
        Case caseEntity = caseService.getCaseById(id);
        byte[] pdfBytes = pdfService.generateCasePdf(caseEntity);

        return Response.ok(pdfBytes)
                .header("Content-Disposition", "inline; filename=case-" + id + ".pdf")
                .build();
    }

    @POST
    @Path("/sos")
    //@RolesAllowed({"VEHICLE"})
    public Response createSosCase(@Valid SosCaseCreateRequest request) {
        Long userId = Long.parseLong(jwt.getSubject());

        Case createdCase = caseService.createSosCase(request, userId);

        webSocketEndpoint.broadcastCaseUpdate(CaseResponse.fromEntity(createdCase), "CREATE");

        return Response.status(Response.Status.CREATED)
                .entity(CaseResponse.fromEntity(createdCase))
                .build();
    }

    @POST
    @Path("/regular")
    //@RolesAllowed({"VEHICLE"})
    public Response createRegularCase(@Valid RegularCaseCreateRequest request) {
        Long userId = Long.parseLong(jwt.getSubject());

        Case createdCase = caseService.createRegularCase(request, userId);

        webSocketEndpoint.broadcastCaseUpdate(CaseResponse.fromEntity(createdCase), "CREATE");

        return Response.status(Response.Status.CREATED)
                .entity(CaseResponse.fromEntity(createdCase))
                .build();
    }
    
    @PUT
    @Path("/{id}/acknowledge")
    //@RolesAllowed({"HOSPITAL"})
    public Response acknowledgeCase(@PathParam("id") Long id, @Valid AcknowledgeCaseRequest request) {
        Case caseEntity = caseService.acknowledgeCase(id, request);

        webSocketEndpoint.broadcastCaseUpdate(CaseResponse.fromEntity(caseEntity), "ACKNOWLEDGE");

        return Response.ok(CaseResponse.fromEntity(caseEntity)).build();
    }

    @PUT
    @Path("/{id}/end")
    //@RolesAllowed({"VEHICLE", "ADMIN"})
    public Response endCase(@PathParam("id") Long id, @Valid EndCaseRequest request) {
        Case caseEntity = caseService.endCase(id, request);

        webSocketEndpoint.broadcastCaseUpdate(CaseResponse.fromEntity(caseEntity), "END");

        return Response.ok(CaseResponse.fromEntity(caseEntity)).build();
    }

    @PUT
    @Path("/{id}")
    //@RolesAllowed({"VEHICLE", "ADMIN"})
    public Response updateCase(@PathParam("id") Long id, @Valid UpdateCaseRequest request) {
        Case caseEntity = caseService.updateCase(id, request);

        webSocketEndpoint.broadcastCaseUpdate(CaseResponse.fromEntity(caseEntity), "UPDATE");

        return Response.ok(CaseResponse.fromEntity(caseEntity)).build();
    }

    @DELETE
    @Path("/{id}")
    //@RolesAllowed({"ADMIN"})
    public Response deleteCase(@PathParam("id") Long id) {
        caseService.deleteCase(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/active/{userId}")
    public Response getActiveCaseByUserId(@PathParam("userId") Long userId) {
        Case caseEntity = caseService.getActiveCaseByUserId(userId);
        return Response.ok(CaseResponse.fromEntity(caseEntity)).build();
    }
}