package com.pedro.lab_control.controller;

import com.pedro.lab_control.dto.AtivoRequest;
import com.pedro.lab_control.dto.CategoriaDTO;
import com.pedro.lab_control.dto.CategoriaRequest;
import com.pedro.lab_control.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {
    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> listarTodas(
            @RequestParam(defaultValue = "false") boolean incluirInativos) {
        return ResponseEntity.ok(categoriaService.listarTodas(incluirInativos));
    }

    @PostMapping
    public ResponseEntity<CategoriaDTO> salvar(@Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.salvar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDTO> atualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.ok(categoriaService.atualizar(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CategoriaDTO> alterarStatus(@PathVariable Long id, @Valid @RequestBody AtivoRequest request) {
        return ResponseEntity.ok(categoriaService.alterarStatus(id, request.ativo()));
    }
}
