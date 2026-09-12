package com.pedro.lab_control.service;

import com.pedro.lab_control.dto.CategoriaDTO;
import com.pedro.lab_control.dto.ProdutoDTO;
import com.pedro.lab_control.dto.RelatorioComprasDTO;
import com.pedro.lab_control.model.Produto;
import com.pedro.lab_control.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
            produto.setDataValidade(produtoAtualizado.getDataValidade());
            produto.setCategoria(produtoAtualizado.getCategoria());
            return produtoRepository.save(produto);
        }).orElseThrow(() -> new RuntimeException("Produto não encontrado!"));
    }

    public void excluir(Long id) {
        produtoRepository.deleteById(id);
    }

    public List<ProdutoDTO> listarRepor() {
        return produtoRepository.findRepor().stream()
                .map(ProdutoDTO::from)
                .toList();
    }

    public List<ProdutoDTO> listarProximosVencimento(int dias) {
        LocalDate limite = LocalDate.now().plusDays(dias);
        return produtoRepository.findProximosVencimento(limite).stream()
                .map(ProdutoDTO::from)
                .toList();
    }

    public RelatorioComprasDTO gerarRelatorioCompras() {
        Map<CategoriaDTO, List<ProdutoDTO>> agrupado = listarRepor().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        ProdutoDTO::categoria,
                        LinkedHashMap::new,
                        java.util.stream.Collectors.toList()));

        List<RelatorioComprasDTO.CategoriaProdutos> categorias = agrupado.entrySet().stream()
                .map(entry -> new RelatorioComprasDTO.CategoriaProdutos(entry.getKey(), entry.getValue()))
                .toList();

        return new RelatorioComprasDTO(categorias);
    }
}
