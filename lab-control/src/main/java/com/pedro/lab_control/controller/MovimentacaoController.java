package com.pedro.lab_control.controller;

import com.pedro.lab_control.model.Movimentacao;
import com.pedro.lab_control.model.TipoMovimentacao;
import com.pedro.lab_control.service.MovimentacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/movimentacoes")
public class MovimentacaoController {
    private final MovimentacaoService movimentacaoService;

    public MovimentacaoController(MovimentacaoService movimentacaoService){
        this.movimentacaoService = movimentacaoService;
    }

    @PostMapping("/entrada")
    public ResponseEntity<Movimentacao> registrarEntrada(@RequestBody Movimentacao movimentacao){
        movimentacao.setTipo(TipoMovimentacao.ENTRADA);
        Movimentacao novaMovimentacao = movimentacaoService.registrar(movimentacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaMovimentacao);
    }

    @PostMapping("/saida")
    public ResponseEntity<Movimentacao> registrarSaida(@RequestBody Movimentacao movimentacao){
        movimentacao.setTipo(TipoMovimentacao.SAIDA);
        Movimentacao novaMovimentacao = movimentacaoService.registrar(movimentacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaMovimentacao);
    }
}
