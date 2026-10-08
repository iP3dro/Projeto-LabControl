package com.pedro.lab_control.dto;

import com.pedro.lab_control.model.Lote;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public record LoteDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        CategoriaDTO categoria,
        Integer quantidade,
        LocalDate dataValidade,
        LocalDateTime dataEntrada,
        Long diasParaVencimento,
        Boolean vencido
) {

    public static LoteDTO from(Lote lote) {
        LocalDate validade = lote.getDataValidade();
        Long dias = null;
        Boolean vencido = null;

        if (validade != null) {
            dias = ChronoUnit.DAYS.between(LocalDate.now(), validade);
            vencido = dias < 0;
        }

        return new LoteDTO(
                lote.getId(),
                lote.getProduto().getId(),
                lote.getProduto().getNome(),
                CategoriaDTO.from(lote.getProduto().getCategoria()),
                lote.getQuantidade(),
                validade,
                lote.getDataEntrada(),
                dias,
                vencido
        );
    }
}
