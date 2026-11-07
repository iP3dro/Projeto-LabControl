package com.pedro.lab_control.service;

import com.pedro.lab_control.dto.CategoriaDTO;
import com.pedro.lab_control.dto.CategoriaRequest;
import com.pedro.lab_control.exception.RegraDeNegocioException;
import com.pedro.lab_control.exception.ResourceNotFoundException;
import com.pedro.lab_control.model.Categoria;
import com.pedro.lab_control.repository.CategoriaRepository;
import com.pedro.lab_control.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, ProdutoRepository produtoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.produtoRepository = produtoRepository;
    }

    public List<CategoriaDTO> listarTodas(boolean incluirInativos) {
        List<Categoria> categorias = incluirInativos
                ? categoriaRepository.findAllByOrderByNomeAsc()
                : categoriaRepository.findByAtivoTrueOrderByNomeAsc();
        return categorias.stream().map(CategoriaDTO::from).toList();
    }

    public CategoriaDTO salvar(CategoriaRequest request) {
        Categoria categoria = new Categoria();
        categoria.setNome(request.nome().trim());
        categoria.setAtivo(true);
        return CategoriaDTO.from(categoriaRepository.save(categoria));
    }

    public CategoriaDTO atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscar(id);
        categoria.setNome(request.nome().trim());
        return CategoriaDTO.from(categoriaRepository.save(categoria));
    }

    public CategoriaDTO alterarStatus(Long id, boolean ativo) {
        Categoria categoria = buscar(id);
        categoria.setAtivo(ativo);
        return CategoriaDTO.from(categoriaRepository.save(categoria));
    }

    public void excluir(Long id) {
        Categoria categoria = buscar(id);
        if (produtoRepository.existsByCategoriaId(id)) {
            throw new RegraDeNegocioException("Não é possível excluir esta categoria: existem produtos vinculados a ela.");
        }
        categoriaRepository.delete(categoria);
    }

    private Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
    }
}
