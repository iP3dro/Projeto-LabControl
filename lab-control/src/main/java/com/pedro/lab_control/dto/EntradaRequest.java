package com.pedro.lab_control.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record EntradaRequest(
        @NotNull(message = "Selecione o produto.")
        Long produtoId,

        @NotNull(message = "Informe a quantidade.")
        @Positive(message = "A quantidade deve ser maior que zero.")
        Integer quantidade,

        LocalDate dataValidade
) {
}
