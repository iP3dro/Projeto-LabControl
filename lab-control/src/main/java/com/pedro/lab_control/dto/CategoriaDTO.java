package com.pedro.lab_control.dto;

import com.pedro.lab_control.model.Categoria;

public record CategoriaDTO(Long id, String nome) {

    public static CategoriaDTO from(Categoria categoria) {
        return new CategoriaDTO(categoria.getId(), categoria.getNome());
    }
}
