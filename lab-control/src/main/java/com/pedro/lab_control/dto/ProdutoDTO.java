package com.pedro.lab_control.dto;

import com.pedro.lab_control.model.Lote;
import com.pedro.lab_control.model.Produto;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record ProdutoDTO(
        Long id,
        String nome,
        Integer quantidadeAtual,
        Integer quantidadeMinima,
        CategoriaDTO categoria,
        String status,
        LocalDate dataValidade,
        Long diasParaVencimento,
        Boolean vencido
) {

    public static ProdutoDTO from(Produto produto, Lote loteMaisProximo) {
        boolean repor = produto.getQuantidadeAtual() <= produto.getQuantidadeMinima();
        String status = repor ? "REPOR" : "OK";

        LocalDate validade = loteMaisProximo != null ? loteMaisProximo.getDataValidade() : null;
        Long dias = null;
        Boolean vencido = null;

        if (validade != null) {
            dias = ChronoUnit.DAYS.between(LocalDate.now(), validade);
            vencido = dias < 0;
        }

        return new ProdutoDTO(
                produto.getId(),
                produto.getNome(),
                produto.getQuantidadeAtual(),
                produto.getQuantidadeMinima(),
                CategoriaDTO.from(produto.getCategoria()),
                status,
                validade,
                dias,
                vencido
        );
    }
}
