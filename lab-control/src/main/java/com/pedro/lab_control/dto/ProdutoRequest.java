package com.pedro.lab_control.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProdutoRequest(
        @NotBlank(message = "Informe o nome do produto.")
        @Size(max = 150, message = "O nome do produto deve ter no máximo 150 caracteres.")
        String nome,

        @NotNull(message = "Informe a quantidade mínima.")
        @PositiveOrZero(message = "A quantidade mínima não pode ser negativa.")
        Integer quantidadeMinima,

        @NotNull(message = "Selecione uma categoria.")
        Long categoriaId
) {
}
