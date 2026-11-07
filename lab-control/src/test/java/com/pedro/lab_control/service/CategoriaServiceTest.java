package com.pedro.lab_control.service;

import com.pedro.lab_control.dto.CategoriaDTO;
import com.pedro.lab_control.exception.RegraDeNegocioException;
import com.pedro.lab_control.exception.ResourceNotFoundException;
import com.pedro.lab_control.model.Categoria;
import com.pedro.lab_control.repository.CategoriaRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    private CategoriaService service;

    @BeforeEach
    void setUp() {
        service = new CategoriaService(categoriaRepository, produtoRepository);
    }

    @Test
    void desativarCategoria() {
        Categoria categoria = categoria(1L, "Resinas", true);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(inv -> inv.getArgument(0));

        CategoriaDTO dto = service.alterarStatus(1L, false);

        assertFalse(dto.ativo());
    }

    @Test
    void ativarCategoria() {
        Categoria categoria = categoria(1L, "Resinas", false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(inv -> inv.getArgument(0));

        CategoriaDTO dto = service.alterarStatus(1L, true);

        assertTrue(dto.ativo());
    }

    @Test
    void listarSomenteAtivasPorPadrao() {
        when(categoriaRepository.findByAtivoTrueOrderByNomeAsc()).thenReturn(List.of(categoria(1L, "Resinas", true)));

        assertEquals(1, service.listarTodas(false).size());
    }

    @Test
    void listarIncluiInativasQuandoSolicitado() {
        when(categoriaRepository.findAllByOrderByNomeAsc())
                .thenReturn(List.of(categoria(1L, "Resinas", true), categoria(2L, "Porcelanas", false)));

        assertEquals(2, service.listarTodas(true).size());
    }

    @Test
    void alterarStatusDeCategoriaInexistenteLancaErro() {
        when(categoriaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.alterarStatus(99L, false));
    }

    @Test
    void excluirCategoriaSemProdutosDeleta() {
        Categoria categoria = categoria(1L, "Resinas", true);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(produtoRepository.existsByCategoriaId(1L)).thenReturn(false);

        service.excluir(1L);

        verify(categoriaRepository).delete(categoria);
    }

    @Test
    void excluirCategoriaComProdutosLancaErro() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria(1L, "Resinas", true)));
        when(produtoRepository.existsByCategoriaId(1L)).thenReturn(true);

        assertThrows(RegraDeNegocioException.class, () -> service.excluir(1L));
    }

    private Categoria categoria(Long id, String nome, boolean ativo) {
        Categoria categoria = new Categoria();
        categoria.setId(id);
        categoria.setNome(nome);
        categoria.setAtivo(ativo);
        return categoria;
    }
}
