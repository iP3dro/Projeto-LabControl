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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final LoteRepository loteRepository;

    public MovimentacaoService(MovimentacaoRepository movimentacaoRepository,
                               ProdutoRepository produtoRepository,
                               LoteRepository loteRepository) {
        this.movimentacaoRepository = movimentacaoRepository;
        this.produtoRepository = produtoRepository;
        this.loteRepository = loteRepository;
    }

    @Transactional
    public MovimentacaoDTO registrarEntrada(EntradaRequest request, UsuarioAutenticado usuario) {
        Produto produto = buscarProduto(request.produtoId());

        Lote lote = new Lote();
        lote.setProduto(produto);
        lote.setQuantidade(request.quantidade());
        lote.setDataValidade(request.dataValidade());
        lote.setDataEntrada(LocalDateTime.now());
        loteRepository.save(lote);

        atualizarEstoque(produto);
        return registrar(produto, lote, request.quantidade(), TipoMovimentacao.ENTRADA, usuario);
    }

    @Transactional
    public MovimentacaoDTO registrarSaida(SaidaRequest request, UsuarioAutenticado usuario) {
        Produto produto = buscarProduto(request.produtoId());

        Lote lote = loteRepository.findById(request.loteId())
                .orElseThrow(() -> new ResourceNotFoundException("Lote não encontrado."));

        if (!lote.getProduto().getId().equals(produto.getId())) {
            throw new RegraDeNegocioException("O lote selecionado não pertence ao produto informado.");
        }
        if (lote.getQuantidade() < request.quantidade()) {
            throw new RegraDeNegocioException(
                    "Estoque insuficiente no lote. Disponível: " + lote.getQuantidade() + " unidade(s).");
        }

        lote.setQuantidade(lote.getQuantidade() - request.quantidade());
        loteRepository.save(lote);

        atualizarEstoque(produto);
        return registrar(produto, lote, request.quantidade(), TipoMovimentacao.SAIDA, usuario);
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoDTO> listarTodas() {
        return movimentacaoRepository.findAllByOrderByDataDesc().stream()
                .map(MovimentacaoDTO::from)
                .toList();
    }

    private MovimentacaoDTO registrar(Produto produto, Lote lote, Integer quantidade,
                                      TipoMovimentacao tipo, UsuarioAutenticado usuario) {
        Movimentacao movimentacao = new Movimentacao();
        movimentacao.setProduto(produto);
        movimentacao.setLote(lote);
        movimentacao.setQuantidade(quantidade);
        movimentacao.setTipo(tipo);
        movimentacao.setData(LocalDateTime.now());
        if (usuario != null) {
            movimentacao.setUsuarioUid(usuario.uid());
            movimentacao.setUsuarioEmail(usuario.email());
        }
        return MovimentacaoDTO.from(movimentacaoRepository.save(movimentacao));
    }

    private void atualizarEstoque(Produto produto) {
        Integer total = loteRepository.somarQuantidadePorProduto(produto.getId());
        produto.setQuantidadeAtual(total != null ? total : 0);
        produtoRepository.save(produto);
    }

    private Produto buscarProduto(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado."));
    }
}
