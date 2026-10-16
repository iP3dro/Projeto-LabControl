package com.pedro.lab_control.repository;

import com.pedro.lab_control.model.Movimentacao;
import com.pedro.lab_control.model.TipoMovimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    @Query("""
            SELECT m FROM Movimentacao m
            WHERE (:produtoId IS NULL OR m.produto.id = :produtoId)
              AND (:tipo IS NULL OR m.tipo = :tipo)
            ORDER BY m.data DESC
            """)
    List<Movimentacao> filtrar(@Param("produtoId") Long produtoId,
                               @Param("tipo") TipoMovimentacao tipo);
}
