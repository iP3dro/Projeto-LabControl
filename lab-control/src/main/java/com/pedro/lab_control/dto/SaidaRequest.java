package com.pedro.lab_control.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SaidaRequest(
        @NotNull(message = "Selecione o produto.")
        Long produtoId,

        @NotNull(message = "Selecione o lote.")
        Long loteId,

        @NotNull(message = "Informe a quantidade.")
        @Positive(message = "A quantidade deve ser maior que zero.")
        Integer quantidade
) {
}
