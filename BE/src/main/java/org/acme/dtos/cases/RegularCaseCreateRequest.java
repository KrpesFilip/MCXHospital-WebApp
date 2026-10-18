package org.acme.dtos.cases;

import jakarta.validation.constraints.NotNull;

public record RegularCaseCreateRequest(
        @NotNull
        String patientName,

        @NotNull
        Integer birthYear,

        @NotNull
        String sex,

        @NotNull
        String description,

        @NotNull
        Integer bpm,

        @NotNull
        Integer systolicPressure,

        @NotNull
        Integer diastolicPressure,

        @NotNull
        Integer resRate,

        @NotNull
        Integer saturation,

        @NotNull
        Double temperature,

        @NotNull
        Double latitude,

        @NotNull
        Double longitude
) {}