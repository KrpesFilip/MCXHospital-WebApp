package org.acme.dtos.cases;

import org.acme.enums.Priority;
import org.acme.models.Case;

import java.time.Instant;


public record CaseResponse(
    Long id,
    Long createdById,
    Instant createdAt,
    Boolean isSos,
    String description,
    String patientName,
    Integer birthYear,
    String sex,
    Integer bpm,
    Integer systolicPressure,
    Integer diastolicPressure,
    Integer resRate,
    Integer saturation,
    Double temperature,
    Boolean acknowledged,
    Boolean isActive,
    Priority priority,
    Double latitude,
    Double longitude
) {
    public static CaseResponse fromEntity(Case caseEntity) {
        return new CaseResponse(
            caseEntity.id,
            caseEntity.getCreatedBy() != null ? caseEntity.getCreatedBy().id : null,
            caseEntity.getCreatedAt(),
            caseEntity.getIsSos(),
            caseEntity.getDescription(),
            caseEntity.getPatientName(),
            caseEntity.getBirthYear(),
            caseEntity.getSex(),
            caseEntity.getBpm(),
            caseEntity.getSystolicPressure(),
            caseEntity.getDiastolicPressure(),
            caseEntity.getResRate(),
            caseEntity.getSaturation(),
            caseEntity.getTemperature(),
            caseEntity.getAcknowledged(),
            caseEntity.getIsActive(),
            caseEntity.getPriority(),
            caseEntity.getLatitude(),
            caseEntity.getLongitude()
        );
    }
}