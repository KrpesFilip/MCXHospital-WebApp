package org.acme.dtos.cases;

import jakarta.validation.constraints.NotNull;

public record SosCaseCreateRequest(
    @NotNull
    String patientName,

    @NotNull 
    Integer birthYear,

    @NotNull
    String sex,

    @NotNull 
    String description,

    @NotNull
    Double latitude,

    @NotNull
    Double longitude
) {}