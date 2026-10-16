package com.pedro.lab_control.service;

import com.pedro.lab_control.dto.EntradaRequest;
import com.pedro.lab_control.dto.MovimentacaoDTO;
import com.pedro.lab_control.dto.SaidaRequest;
import com.pedro.lab_control.exception.RegraDeNegocioException;
import com.pedro.lab_control.exception.ResourceNotFoundException;
import com.pedro.lab_control.model.Lote;
import com.pedro.lab_control.model.Movimentacao;
import com.pedro.lab_control.model.Produto;
import com.pedro.lab_control.model.TipoMovimentacao;
import com.pedro.lab_control.repository.LoteRepository;
import com.pedro.lab_control.repository.MovimentacaoRepository;
import com.pedro.lab_control.repository.ProdutoRepository;
import com.pedro.lab_control.security.UsuarioAutenticado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovimentacaoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private LoteRepository loteRepository;

    @Mock
    private MovimentacaoRepository movimentacaoRepository;

    private MovimentacaoService service;
    private final UsuarioAutenticado usuario = new UsuarioAutenticado("uid-1", "usuario@teste.com");

    @BeforeEach
    void setUp() {
        service = new MovimentacaoService(movimentacaoRepository, produtoRepository, loteRepository);
    }

    @Test
    void entradaCriaLoteERegistraAutoria() {
        Produto produto = produto(1L);
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(loteRepository.somarQuantidadePorProduto(1L)).thenReturn(8);
        when(loteRepository.save(any(Lote.class))).thenAnswer(inv -> inv.getArgument(0));
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(inv -> inv.getArgument(0));

        MovimentacaoDTO dto = service.registrarEntrada(new EntradaRequest(1L, 8, null), usuario);

        assertEquals(TipoMovimentacao.ENTRADA, dto.tipo());
        assertEquals(8, dto.quantidade());
        assertEquals("usuario@teste.com", dto.usuarioEmail());
    }

    @Test
    void saidaConsomeQuantidadeDoLote() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto(1L)));
        when(loteRepository.findById(10L)).thenReturn(Optional.of(lote(1L, 10L, 5)));
        when(loteRepository.somarQuantidadePorProduto(1L)).thenReturn(2);
        when(movimentacaoRepository.save(any(Movimentacao.class))).thenAnswer(inv -> inv.getArgument(0));

        service.registrarSaida(new SaidaRequest(1L, 10L, 3), usuario);

        verify(loteRepository).save(argThat(lote -> lote.getQuantidade() == 2));
    }

    @Test
    void saidaAcimaDoEstoqueLancaRegraDeNegocio() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto(1L)));
        when(loteRepository.findById(10L)).thenReturn(Optional.of(lote(1L, 10L, 2)));

        assertThrows(RegraDeNegocioException.class,
                () -> service.registrarSaida(new SaidaRequest(1L, 10L, 5), usuario));
    }

    @Test
    void saidaDeLoteDeOutroProdutoLancaRegraDeNegocio() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto(1L)));
        when(loteRepository.findById(10L)).thenReturn(Optional.of(lote(2L, 10L, 5)));

        assertThrows(RegraDeNegocioException.class,
                () -> service.registrarSaida(new SaidaRequest(1L, 10L, 1), usuario));
    }

    @Test
    void produtoInexistenteLancaResourceNotFound() {
        when(produtoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.registrarEntrada(new EntradaRequest(999L, 1, null), usuario));
    }

    private Produto produto(Long id) {
        Produto produto = new Produto();
        produto.setId(id);
        produto.setQuantidadeAtual(0);
        return produto;
    }

    private Lote lote(Long produtoId, Long loteId, int quantidade) {
        Lote lote = new Lote();
        lote.setId(loteId);
        lote.setProduto(produto(produtoId));
        lote.setQuantidade(quantidade);
        return lote;
    }
}
