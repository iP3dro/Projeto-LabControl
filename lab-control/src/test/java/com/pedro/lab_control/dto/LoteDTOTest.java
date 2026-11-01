package com.pedro.lab_control.dto;

import com.pedro.lab_control.model.Categoria;
import com.pedro.lab_control.model.Lote;
import com.pedro.lab_control.model.Produto;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoteDTOTest {

    private Lote lote(LocalDate validade) {
        Categoria categoria = new Categoria();
        categoria.setId(1L);
        categoria.setNome("Categoria");
        categoria.setAtivo(true);

        Produto produto = new Produto();
        produto.setId(1L);
        produto.setNome("Produto");
        produto.setCategoria(categoria);

        Lote lote = new Lote();
        lote.setId(1L);
        lote.setProduto(produto);
        lote.setQuantidade(5);
        lote.setDataValidade(validade);
        return lote;
    }

    @Test
    void loteVencidoDeveMarcarComoVencido() {
        LoteDTO dto = LoteDTO.from(lote(LocalDate.now().minusDays(1)));

        assertTrue(dto.vencido());
        assertEquals(-1L, dto.diasParaVencimento());
    }

    @Test
    void loteVencendoEmTrintaDiasNaoEstaVencido() {
        LoteDTO dto = LoteDTO.from(lote(LocalDate.now().plusDays(30)));

        assertFalse(dto.vencido());
        assertEquals(30L, dto.diasParaVencimento());
    }

    @Test
    void loteSemValidadeNaoTemDiasNemVencimento() {
        LoteDTO dto = LoteDTO.from(lote(null));

        assertNull(dto.vencido());
        assertNull(dto.diasParaVencimento());
    }
}
