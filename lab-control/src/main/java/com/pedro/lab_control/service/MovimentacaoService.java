package com.pedro.lab_control.service;

import com.pedro.lab_control.model.Movimentacao;
import com.pedro.lab_control.model.Produto;
import com.pedro.lab_control.model.TipoMovimentacao;
import com.pedro.lab_control.repository.MovimentacaoRepository;
import com.pedro.lab_control.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final ProdutoRepository produtoRepository;

    public MovimentacaoService(MovimentacaoRepository movimentacaoRepository, ProdutoRepository produtoRepository){
        this.movimentacaoRepository = movimentacaoRepository;
        this.produtoRepository = produtoRepository;
    }

    @Transactional
    public Movimentacao registrar(Movimentacao movimentacao){
        // Busca produto no banco para saber a quantidade atual
        Produto produto = produtoRepository.findById(movimentacao.getProduto().getId())
                .orElseThrow(()-> new RuntimeException("Produto não encontrado"));

        movimentacao.setData(LocalDateTime.now()); // Preenche data e hora atual

        if (movimentacao.getTipo() == TipoMovimentacao.ENTRADA){
            produto.setQuantidadeAtual(produto.getQuantidadeAtual() + movimentacao.getQuantidade());
        }else if (movimentacao.getTipo() == TipoMovimentacao.SAIDA){
            //Bloquea estoque negativo
            if(produto.getQuantidadeAtual() < movimentacao.getQuantidade()){
                throw new RuntimeException("Estoque insuficiente! Quantidade atual: " + movimentacao.getQuantidade());
            }
            produto.setQuantidadeAtual(produto.getQuantidadeAtual() - movimentacao.getQuantidade());
        }
        //Salva produto atualizado
        produtoRepository.save(produto);

        //Salva e retorna histórico da movimentação
        return movimentacaoRepository.save(movimentacao);
    }
}
