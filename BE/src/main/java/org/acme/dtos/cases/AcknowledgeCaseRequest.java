package org.acme.dtos.cases;

import jakarta.validation.constraints.NotNull;

public record AcknowledgeCaseRequest(
        @NotNull
        Boolean acknowledged
) {}
