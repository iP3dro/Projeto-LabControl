package com.pedro.lab_control.service;

import com.pedro.lab_control.dto.LoteDTO;
import com.pedro.lab_control.exception.ResourceNotFoundException;
import com.pedro.lab_control.repository.LoteRepository;
import com.pedro.lab_control.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoteService {
    private final LoteRepository loteRepository;
    private final ProdutoRepository produtoRepository;

    public LoteService(LoteRepository loteRepository, ProdutoRepository produtoRepository) {
        this.loteRepository = loteRepository;
        this.produtoRepository = produtoRepository;
    }

    public List<LoteDTO> listarPorProduto(Long produtoId) {
        if (!produtoRepository.existsById(produtoId)) {
            throw new ResourceNotFoundException("Produto não encontrado.");
        }
        return loteRepository.findByProdutoIdOrderByDataValidadeAscIdAsc(produtoId).stream()
                .map(LoteDTO::from)
                .toList();
    }

    public List<LoteDTO> listarVencimentos(int dias) {
        LocalDate limite = LocalDate.now().plusDays(dias);
        return loteRepository.findVencendoAte(limite).stream()
                .map(LoteDTO::from)
                .toList();
    }
}
