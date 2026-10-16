package com.pedro.lab_control.dto;

import jakarta.validation.constraints.NotNull;

public record AtivoRequest(
        @NotNull(message = "Informe o status.")
        Boolean ativo
) {
}
