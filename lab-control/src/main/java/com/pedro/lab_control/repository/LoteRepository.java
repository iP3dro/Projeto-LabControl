package com.pedro.lab_control.repository;

import com.pedro.lab_control.model.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    List<Lote> findByProdutoIdOrderByDataValidadeAscIdAsc(Long produtoId);

    List<Lote> findByQuantidadeGreaterThanOrderByDataValidadeAsc(Integer quantidade);

    @Query("SELECT l FROM Lote l WHERE l.quantidade > 0 AND l.dataValidade IS NOT NULL AND l.dataValidade <= :limite ORDER BY l.dataValidade")
    List<Lote> findVencendoAte(@Param("limite") LocalDate limite);

    @Query("SELECT COALESCE(SUM(l.quantidade), 0) FROM Lote l WHERE l.produto.id = :produtoId")
    Integer somarQuantidadePorProduto(@Param("produtoId") Long produtoId);
}
