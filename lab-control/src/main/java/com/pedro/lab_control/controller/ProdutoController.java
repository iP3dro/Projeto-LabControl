package com.pedro.lab_control.controller;

import com.pedro.lab_control.dto.AtivoRequest;
import com.pedro.lab_control.dto.ProdutoDTO;
import com.pedro.lab_control.dto.ProdutoRequest;
import com.pedro.lab_control.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {
    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public ResponseEntity<List<ProdutoDTO>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(defaultValue = "false") boolean incluirInativos) {
        return ResponseEntity.ok(produtoService.listar(busca, categoriaId, incluirInativos));
    }

    @GetMapping("/repor")
    public ResponseEntity<List<ProdutoDTO>> listarRepor() {
        return ResponseEntity.ok(produtoService.listarRepor());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProdutoDTO> salvar(@Valid @RequestBody ProdutoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.salvar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoRequest request) {
        return ResponseEntity.ok(produtoService.atualizar(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProdutoDTO> alterarStatus(@PathVariable Long id, @Valid @RequestBody AtivoRequest request) {
        return ResponseEntity.ok(produtoService.alterarStatus(id, request.ativo()));
    }
}
