package com.pedro.lab_control.service;

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

    public List<Categoria> listarTodas(){
        return categoriaRepository.findAll();
    }

    public Categoria salvar(Categoria categoria){
        return categoriaRepository.save(categoria);
    }

    public Categoria atualizar(Long id, Categoria categoriaAtualizada) {
        return categoriaRepository.findById(id).map(categoria -> {
            categoria.setNome(categoriaAtualizada.getNome());
            return categoriaRepository.save(categoria);
        }).orElseThrow(() -> new RuntimeException("Categoria não encontrada!"));
    }

    public void excluir(Long id) {
        categoriaRepository.deleteById(id);
    }

}
