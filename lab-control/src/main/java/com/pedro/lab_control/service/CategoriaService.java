package com.pedro.lab_control.service;

import com.pedro.lab_control.dto.CategoriaDTO;
import com.pedro.lab_control.dto.CategoriaRequest;
import com.pedro.lab_control.exception.ResourceNotFoundException;
import com.pedro.lab_control.model.Categoria;
import com.pedro.lab_control.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<CategoriaDTO> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(CategoriaDTO::from)
                .toList();
    }

    public CategoriaDTO salvar(CategoriaRequest request) {
        Categoria categoria = new Categoria();
        categoria.setNome(request.nome().trim());
        return CategoriaDTO.from(categoriaRepository.save(categoria));
    }

    public CategoriaDTO atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscar(id);
        categoria.setNome(request.nome().trim());
        return CategoriaDTO.from(categoriaRepository.save(categoria));
    }

    public void excluir(Long id) {
        categoriaRepository.delete(buscar(id));
    }

    private Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
    }
}
