package com.pedro.lab_control.dto;

import com.pedro.lab_control.model.Produto;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record ProdutoDTO(
        Long id,
        String nome,
        Integer quantidadeAtual,
        Integer quantidadeMinima,
        LocalDate dataValidade,
        CategoriaDTO categoria,
        String status,
        Long diasParaVencimento,
        Boolean vencido
) {

    public static ProdutoDTO from(Produto produto) {
        boolean repor = produto.getQuantidadeAtual() <= produto.getQuantidadeMinima();
        String status = repor ? "REPOR" : "OK";

        LocalDate validade = produto.getDataValidade();
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
                validade,
                CategoriaDTO.from(produto.getCategoria()),
                status,
                dias,
                vencido
        );
    }
}
