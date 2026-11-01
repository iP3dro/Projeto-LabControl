package com.pedro.lab_control.service;

import com.pedro.lab_control.dto.ProdutoDTO;
import com.pedro.lab_control.dto.ProdutoRequest;
import com.pedro.lab_control.dto.RelatorioComprasDTO;
import com.pedro.lab_control.model.Categoria;
import com.pedro.lab_control.model.Produto;
import com.pedro.lab_control.repository.CategoriaRepository;
import com.pedro.lab_control.repository.LoteRepository;
import com.pedro.lab_control.repository.ProdutoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private LoteRepository loteRepository;

    private ProdutoService service;

    @BeforeEach
    void setUp() {
        service = new ProdutoService(produtoRepository, categoriaRepository, loteRepository);
    }

    @Test
    void salvarCriaProdutoAtivoComEstoqueZero() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria(1L, "Resinas")));
        when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

        ProdutoDTO dto = service.salvar(new ProdutoRequest("Resina A2", 5, 1L));

        assertTrue(dto.ativo());
        assertEquals(0, dto.quantidadeAtual());
        assertEquals("Resina A2", dto.nome());
    }

    @Test
    void alterarStatusDesativaProduto() {
        Produto produto = produto(1L, "Resina A", 0, 5, categoria(1L, "Resinas"));
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));
        when(loteRepository.findByQuantidadeGreaterThanOrderByDataValidadeAsc(0)).thenReturn(List.of());

        ProdutoDTO dto = service.alterarStatus(1L, false);

        assertFalse(dto.ativo());
    }

    @Test
    void listarSemInativosFiltraApenasAtivos() {
        when(produtoRepository.buscar(null, null, true)).thenReturn(List.of());
        when(loteRepository.findByQuantidadeGreaterThanOrderByDataValidadeAsc(0)).thenReturn(List.of());

        service.listar(null, null, false);

        verify(produtoRepository).buscar(null, null, true);
    }

    @Test
    void listarComBuscaPassaTermoMinusculoComCuringa() {
        when(produtoRepository.buscar("%resina%", null, true)).thenReturn(List.of());
        when(loteRepository.findByQuantidadeGreaterThanOrderByDataValidadeAsc(0)).thenReturn(List.of());

        service.listar("  Resina ", null, false);

        verify(produtoRepository).buscar("%resina%", null, true);
    }

    @Test
    void listarComCategoriaFiltraPorCategoria() {
        when(produtoRepository.buscar(null, 3L, true)).thenReturn(List.of());
        when(loteRepository.findByQuantidadeGreaterThanOrderByDataValidadeAsc(0)).thenReturn(List.of());

        service.listar(null, 3L, false);

        verify(produtoRepository).buscar(null, 3L, true);
    }

    @Test
    void listarIncluindoInativosPassaAtivoNulo() {
        when(produtoRepository.buscar(null, null, null)).thenReturn(List.of());
        when(loteRepository.findByQuantidadeGreaterThanOrderByDataValidadeAsc(0)).thenReturn(List.of());

        service.listar(null, null, true);

        verify(produtoRepository).buscar(null, null, null);
    }

    @Test
    void gerarRelatorioAgrupaPorCategoria() {
        Categoria resinas = categoria(1L, "Resinas");
        Categoria porcelanas = categoria(2L, "Porcelanas");

        Produto p1 = produto(1L, "Resina A", 2, 5, resinas);
        Produto p2 = produto(2L, "Resina B", 1, 3, resinas);
        Produto p3 = produto(3L, "Porcelana X", 0, 2, porcelanas);

        when(produtoRepository.findRepor()).thenReturn(List.of(p1, p2, p3));
        when(loteRepository.findByQuantidadeGreaterThanOrderByDataValidadeAsc(0)).thenReturn(List.of());

        RelatorioComprasDTO relatorio = service.gerarRelatorioCompras();

        assertEquals(2, relatorio.categorias().size());
        assertEquals("Resinas", relatorio.categorias().get(0).categoria().nome());
        assertEquals(2, relatorio.categorias().get(0).produtos().size());
        assertEquals("Porcelanas", relatorio.categorias().get(1).categoria().nome());
        assertEquals(1, relatorio.categorias().get(1).produtos().size());
    }

    private Categoria categoria(Long id, String nome) {
        Categoria categoria = new Categoria();
        categoria.setId(id);
        categoria.setNome(nome);
        categoria.setAtivo(true);
        return categoria;
    }

    private Produto produto(Long id, String nome, int atual, int minima, Categoria categoria) {
        Produto produto = new Produto();
        produto.setId(id);
        produto.setNome(nome);
        produto.setQuantidadeAtual(atual);
        produto.setQuantidadeMinima(minima);
        produto.setAtivo(true);
        produto.setCategoria(categoria);
        return produto;
    }
}
