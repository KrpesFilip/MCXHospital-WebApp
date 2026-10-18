package org.acme.dtos.cases;

import jakarta.validation.constraints.NotNull;

public record EndCaseRequest(
        @NotNull
        Boolean isActive
) {}