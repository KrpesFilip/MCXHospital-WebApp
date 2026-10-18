package org.acme.dtos.cases;

import jakarta.validation.constraints.NotNull;

public record UpdateCaseRequest(
        @NotNull
        String patientName,

        @NotNull
        Integer birthYear,

        @NotNull
        String sex,

        @NotNull
        String description,

        Integer bpm,
        Integer systolicPressure,
        Integer diastolicPressure,
        Integer resRate,
        Integer saturation,
        Double temperature
) {}