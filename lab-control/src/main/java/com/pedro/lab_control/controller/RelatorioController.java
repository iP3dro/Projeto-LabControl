package com.pedro.lab_control.controller;

import com.pedro.lab_control.dto.RelatorioComprasDTO;
import com.pedro.lab_control.service.ProdutoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/relatorios")
@CrossOrigin(origins = "*")
public class RelatorioController {
    private final ProdutoService produtoService;

    public RelatorioController(ProdutoService produtoService){
        this.produtoService = produtoService;
    }

    @GetMapping("/compras")
    public ResponseEntity<RelatorioComprasDTO> relatorioCompras(){
        return ResponseEntity.ok(produtoService.gerarRelatorioCompras());
    }
}
