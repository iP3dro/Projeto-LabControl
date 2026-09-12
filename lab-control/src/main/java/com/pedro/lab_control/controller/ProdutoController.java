package com.pedro.lab_control.controller;

import com.pedro.lab_control.dto.ProdutoDTO;
import com.pedro.lab_control.model.Produto;
import com.pedro.lab_control.service.ProdutoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {
    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService){
        this.produtoService = produtoService;
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listarTodos(){
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    @GetMapping("/repor")
    public ResponseEntity<List<ProdutoDTO>> listarRepor(){
        return ResponseEntity.ok(produtoService.listarRepor());
    }

    @GetMapping("/vencimento")
    public ResponseEntity<List<ProdutoDTO>> listarProximosVencimento(
            @RequestParam(defaultValue = "30") int dias){
        return ResponseEntity.ok(produtoService.listarProximosVencimento(dias));
    }

    @PostMapping
    public ResponseEntity<Produto> salvar(@RequestBody Produto produto){
        Produto novoProduto = produtoService.salvar(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @RequestBody Produto produto) {
        Produto produtoAtualizado = produtoService.atualizar(id, produto);
        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        produtoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}