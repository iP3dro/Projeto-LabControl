package com.pedro.lab_control.controller;

import com.pedro.lab_control.dto.EntradaRequest;
import com.pedro.lab_control.dto.MovimentacaoDTO;
import com.pedro.lab_control.dto.SaidaRequest;
import com.pedro.lab_control.security.UsuarioAutenticado;
import com.pedro.lab_control.service.MovimentacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movimentacoes")
public class MovimentacaoController {
    private final MovimentacaoService movimentacaoService;

    public MovimentacaoController(MovimentacaoService movimentacaoService) {
        this.movimentacaoService = movimentacaoService;
    }

    @GetMapping
    public ResponseEntity<List<MovimentacaoDTO>> listarTodas() {
        return ResponseEntity.ok(movimentacaoService.listarTodas());
    }

    @PostMapping("/entrada")
    public ResponseEntity<MovimentacaoDTO> registrarEntrada(
            @Valid @RequestBody EntradaRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movimentacaoService.registrarEntrada(request, usuario));
    }

    @PostMapping("/saida")
    public ResponseEntity<MovimentacaoDTO> registrarSaida(
            @Valid @RequestBody SaidaRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movimentacaoService.registrarSaida(request, usuario));
    }
}
