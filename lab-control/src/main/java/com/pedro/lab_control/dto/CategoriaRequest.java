package com.pedro.lab_control.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "Informe o nome da categoria.")
        @Size(max = 100, message = "O nome da categoria deve ter no máximo 100 caracteres.")
        String nome
) {
}
