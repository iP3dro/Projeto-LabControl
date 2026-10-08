package com.pedro.lab_control.dto;

import com.pedro.lab_control.model.Movimentacao;
import com.pedro.lab_control.model.TipoMovimentacao;

import java.time.LocalDateTime;

public record MovimentacaoDTO(
        Long id,
        TipoMovimentacao tipo,
        Integer quantidade,
        LocalDateTime data,
        Long produtoId,
        String produtoNome,
        Long loteId,
        String usuarioEmail
) {

    public static MovimentacaoDTO from(Movimentacao movimentacao) {
        return new MovimentacaoDTO(
                movimentacao.getId(),
                movimentacao.getTipo(),
                movimentacao.getQuantidade(),
                movimentacao.getData(),
                movimentacao.getProduto().getId(),
                movimentacao.getProduto().getNome(),
                movimentacao.getLote() != null ? movimentacao.getLote().getId() : null,
                movimentacao.getUsuarioEmail()
        );
    }
}
