package com.pedro.lab_control.service;

import com.pedro.lab_control.dto.CategoriaDTO;
import com.pedro.lab_control.dto.ProdutoDTO;
import com.pedro.lab_control.dto.ProdutoRequest;
import com.pedro.lab_control.dto.RelatorioComprasDTO;
import com.pedro.lab_control.exception.ResourceNotFoundException;
import com.pedro.lab_control.model.Categoria;
import com.pedro.lab_control.model.Lote;
import com.pedro.lab_control.model.Produto;
import com.pedro.lab_control.repository.CategoriaRepository;
import com.pedro.lab_control.repository.LoteRepository;
import com.pedro.lab_control.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProdutoService {
    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final LoteRepository loteRepository;

    public ProdutoService(ProdutoRepository produtoRepository,
                          CategoriaRepository categoriaRepository,
                          LoteRepository loteRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.loteRepository = loteRepository;
    }

    public List<ProdutoDTO> listarTodos() {
        return paraDTOs(produtoRepository.findAll());
    }

    public ProdutoDTO buscarPorId(Long id) {
        Produto produto = buscarProduto(id);
        Lote lote = loteRepository.findByProdutoIdOrderByDataValidadeAscIdAsc(id).stream()
                .filter(item -> item.getQuantidade() > 0)
                .findFirst()
                .orElse(null);
        return ProdutoDTO.from(produto, lote);
    }

    public ProdutoDTO salvar(ProdutoRequest request) {
        Produto produto = new Produto();
        aplicarDados(produto, request);
        produto.setQuantidadeAtual(0);
        return ProdutoDTO.from(produtoRepository.save(produto), null);
    }

    public ProdutoDTO atualizar(Long id, ProdutoRequest request) {
        Produto produto = buscarProduto(id);
        aplicarDados(produto, request);
        Produto salvo = produtoRepository.save(produto);
        return ProdutoDTO.from(salvo, lotesMaisProximos(List.of(salvo)).get(salvo.getId()));
    }

    public void excluir(Long id) {
        produtoRepository.delete(buscarProduto(id));
    }

    public List<ProdutoDTO> listarRepor() {
        return paraDTOs(produtoRepository.findRepor());
    }

    public RelatorioComprasDTO gerarRelatorioCompras() {
        Map<CategoriaDTO, List<ProdutoDTO>> agrupado = listarRepor().stream()
                .collect(Collectors.groupingBy(
                        ProdutoDTO::categoria,
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<RelatorioComprasDTO.CategoriaProdutos> categorias = agrupado.entrySet().stream()
                .map(entry -> new RelatorioComprasDTO.CategoriaProdutos(entry.getKey(), entry.getValue()))
                .toList();

        return new RelatorioComprasDTO(categorias);
    }

    private void aplicarDados(Produto produto, ProdutoRequest request) {
        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
        produto.setNome(request.nome().trim());
        produto.setQuantidadeMinima(request.quantidadeMinima());
        produto.setCategoria(categoria);
    }

    private Produto buscarProduto(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado."));
    }

    private List<ProdutoDTO> paraDTOs(List<Produto> produtos) {
        Map<Long, Lote> lotes = lotesMaisProximos(produtos);
        return produtos.stream()
                .map(produto -> ProdutoDTO.from(produto, lotes.get(produto.getId())))
                .toList();
    }

    private Map<Long, Lote> lotesMaisProximos(List<Produto> produtos) {
        Set<Long> ids = produtos.stream().map(Produto::getId).collect(Collectors.toSet());
        Map<Long, Lote> resultado = new HashMap<>();
        for (Lote lote : loteRepository.findByQuantidadeGreaterThanOrderByDataValidadeAsc(0)) {
            Long produtoId = lote.getProduto().getId();
            if (ids.contains(produtoId)) {
                resultado.putIfAbsent(produtoId, lote);
            }
        }
        return resultado;
    }
}
