package com.pedro.lab_control.dto;

import com.pedro.lab_control.model.Categoria;
import com.pedro.lab_control.model.Produto;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ProdutoDTOTest {

    private Produto produto(int atual, int minima) {
        Categoria categoria = new Categoria();
        categoria.setId(1L);
        categoria.setNome("Categoria");
        categoria.setAtivo(true);

        Produto produto = new Produto();
        produto.setId(1L);
        produto.setNome("Produto");
        produto.setQuantidadeAtual(atual);
        produto.setQuantidadeMinima(minima);
        produto.setAtivo(true);
        produto.setCategoria(categoria);
        return produto;
    }

    @Test
    void saldoIgualAoMinimoDeveResultarEmOk() {
        assertEquals("OK", ProdutoDTO.from(produto(5, 5), null).status());
    }

    @Test
    void saldoAbaixoDoMinimoDeveResultarEmRepor() {
        assertEquals("REPOR", ProdutoDTO.from(produto(4, 5), null).status());
    }

    @Test
    void saldoAcimaDoMinimoDeveResultarEmOk() {
        assertEquals("OK", ProdutoDTO.from(produto(6, 5), null).status());
    }
}
