package com.pedro.lab_control.dto;

import java.util.List;

public record RelatorioComprasDTO(List<CategoriaProdutos> categorias) {

    public record CategoriaProdutos(CategoriaDTO categoria, List<ProdutoDTO> produtos) {
    }
}
