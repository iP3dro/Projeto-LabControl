package com.pedro.lab_control.controller;

import com.pedro.lab_control.dto.LoteDTO;
import com.pedro.lab_control.service.LoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lotes")
public class LoteController {
    private final LoteService loteService;

    public LoteController(LoteService loteService) {
        this.loteService = loteService;
    }

    @GetMapping
    public ResponseEntity<List<LoteDTO>> listarPorProduto(@RequestParam Long produtoId) {
        return ResponseEntity.ok(loteService.listarPorProduto(produtoId));
    }

    @GetMapping("/vencimento")
    public ResponseEntity<List<LoteDTO>> listarVencimentos(@RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(loteService.listarVencimentos(dias));
    }
}
