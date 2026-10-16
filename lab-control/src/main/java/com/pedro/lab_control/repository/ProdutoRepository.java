package com.pedro.lab_control.repository;

import com.pedro.lab_control.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("""
            SELECT p FROM Produto p
            WHERE (:ativo IS NULL OR p.ativo = :ativo)
              AND (:categoriaId IS NULL OR p.categoria.id = :categoriaId)
              AND (:busca IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :busca, '%')))
            ORDER BY p.nome
            """)
    List<Produto> buscar(@Param("busca") String busca,
                         @Param("categoriaId") Long categoriaId,
                         @Param("ativo") Boolean ativo);

    @Query("""
            SELECT p FROM Produto p
            WHERE p.ativo = true AND p.quantidadeAtual <= p.quantidadeMinima
            ORDER BY p.categoria.nome, p.nome
            """)
    List<Produto> findRepor();
}
