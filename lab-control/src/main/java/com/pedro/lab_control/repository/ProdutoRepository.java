package com.pedro.lab_control.repository;

import com.pedro.lab_control.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("SELECT p FROM Produto p WHERE p.quantidadeAtual <= p.quantidadeMinima ORDER BY p.categoria.nome, p.nome")
    List<Produto> findRepor();

    @Query("SELECT p FROM Produto p WHERE p.dataValidade IS NOT NULL AND p.dataValidade <= :limite ORDER BY p.dataValidade")
    List<Produto> findProximosVencimento(@Param("limite") LocalDate limite);
}
