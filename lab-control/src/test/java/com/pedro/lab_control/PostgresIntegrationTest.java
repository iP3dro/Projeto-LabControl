package com.pedro.lab_control;

import com.pedro.lab_control.model.Categoria;
import com.pedro.lab_control.model.Lote;
import com.pedro.lab_control.model.Produto;
import com.pedro.lab_control.repository.CategoriaRepository;
import com.pedro.lab_control.repository.LoteRepository;
import com.pedro.lab_control.repository.ProdutoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Testcontainers
@SpringBootTest
@Transactional
class PostgresIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Test
    void buscarFiltraPorNomeECategoria() {
        Categoria resinas = salvarCategoria("Resinas");
        Categoria porcelanas = salvarCategoria("Porcelanas");
        salvarProduto("Resina A2", resinas, 10, 5);
        salvarProduto("Porcelana X", porcelanas, 0, 2);

        assertEquals(1, produtoRepository.buscar("%resina%", null, true).size());
        assertEquals(1, produtoRepository.buscar(null, porcelanas.getId(), true).size());
        assertEquals(2, produtoRepository.buscar(null, null, true).size());
    }

    @Test
    void findReporRespeitaRegraMenorQue() {
        Categoria categoria = salvarCategoria("Resinas");
        salvarProduto("Igual ao minimo", categoria, 5, 5);
        salvarProduto("Abaixo do minimo", categoria, 4, 5);

        List<String> nomes = produtoRepository.findRepor().stream().map(Produto::getNome).toList();

        assertEquals(List.of("Abaixo do minimo"), nomes);
    }

    @Test
    void lotesVencimentoConsideraSomenteComEstoqueEDentroDoLimite() {
        Categoria categoria = salvarCategoria("Resinas");
        Produto produto = salvarProduto("Resina A2", categoria, 10, 5);
        LocalDate limite = LocalDate.now().plusDays(30);

        loteRepository.save(lote(produto, LocalDate.now().minusDays(1), 3));
        loteRepository.save(lote(produto, LocalDate.now().plusDays(30), 4));
        loteRepository.save(lote(produto, LocalDate.now().plusDays(60), 5));

        assertEquals(2, loteRepository.findVencendoAte(limite).size());
    }

    @Test
    void somarQuantidadePorProdutoSomaOsLotes() {
        Categoria categoria = salvarCategoria("Resinas");
        Produto produto = salvarProduto("Resina A2", categoria, 10, 5);

        loteRepository.save(lote(produto, null, 7));
        loteRepository.save(lote(produto, LocalDate.now().plusDays(30), 3));

        assertEquals(10, loteRepository.somarQuantidadePorProduto(produto.getId()));
    }

    @Test
    void migracoesFlywayCriaramAsTabelas() {
        assertTrue(postgres.isRunning());
    }

    private Categoria salvarCategoria(String nome) {
        Categoria categoria = new Categoria();
        categoria.setNome(nome);
        categoria.setAtivo(true);
        return categoriaRepository.save(categoria);
    }

    private Produto salvarProduto(String nome, Categoria categoria, int atual, int minima) {
        Produto produto = new Produto();
        produto.setNome(nome);
        produto.setCategoria(categoria);
        produto.setQuantidadeAtual(atual);
        produto.setQuantidadeMinima(minima);
        produto.setAtivo(true);
        return produtoRepository.save(produto);
    }

    private Lote lote(Produto produto, LocalDate validade, int quantidade) {
        Lote lote = new Lote();
        lote.setProduto(produto);
        lote.setDataValidade(validade);
        lote.setQuantidade(quantidade);
        lote.setDataEntrada(LocalDateTime.now());
        return lote;
    }
}
