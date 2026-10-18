package org.acme.dtos.cases;

public record LocationUpdateRequest(
        String type,
        Long caseId,
        Double latitude,
        Double longitude
) {}