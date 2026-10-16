package com.pedro.lab_control.service;

import com.pedro.lab_control.dto.ProdutoDTO;
import com.pedro.lab_control.dto.ProdutoRequest;
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
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria(1L)));
        when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

        ProdutoDTO dto = service.salvar(new ProdutoRequest("Resina A2", 5, 1L));

        assertTrue(dto.ativo());
        assertEquals(0, dto.quantidadeAtual());
        assertEquals("Resina A2", dto.nome());
    }

    @Test
    void alterarStatusDesativaProduto() {
        Produto produto = new Produto();
        produto.setId(1L);
        produto.setAtivo(true);
        produto.setQuantidadeAtual(0);
        produto.setQuantidadeMinima(5);
        produto.setCategoria(categoria(1L));
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

    private Categoria categoria(Long id) {
        Categoria categoria = new Categoria();
        categoria.setId(id);
        categoria.setNome("Categoria");
        categoria.setAtivo(true);
        return categoria;
    }
}
