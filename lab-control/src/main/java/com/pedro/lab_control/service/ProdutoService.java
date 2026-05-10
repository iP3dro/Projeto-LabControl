package com.pedro.lab_control.service;

import com.pedro.lab_control.model.Produto;
import com.pedro.lab_control.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProdutoService {
    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    public List<Produto> listarTodos(){
        return produtoRepository.findAll();
    }

    public Produto salvar(Produto produto){
        return produtoRepository.save(produto);
    }

    public Produto atualizar(Long id, Produto produtoAtualizado) {
        return produtoRepository.findById(id).map(produto -> {
            produto.setNome(produtoAtualizado.getNome());
            produto.setQuantidadeAtual(produtoAtualizado.getQuantidadeAtual());
            produto.setQuantidadeMinima(produtoAtualizado.getQuantidadeMinima());
            produto.setCategoria(produtoAtualizado.getCategoria());
            return produtoRepository.save(produto);
        }).orElseThrow(() -> new RuntimeException("Produto não encontrado!"));
    }

    public void excluir(Long id) {
        produtoRepository.deleteById(id);
    }
}
