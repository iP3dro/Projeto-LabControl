package com.pedro.lab_control.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> tratarViolacaoDeIntegridade(DataIntegrityViolationException ex) {
        Map<String, String> erroResponse = new HashMap<>();
        erroResponse.put("erro", "Não é possível excluir este registro, pois ele está vinculado a outros itens no sistema.");

        return ResponseEntity.status(HttpStatus.CONFLICT).body(erroResponse);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> tratarErrosDeRegraDeNegocio(RuntimeException ex) {

        // Objeto no formato "Chave : Valor" para virar um JSON
        Map<String, String> erroResponse = new HashMap<>();
        erroResponse.put("erro", ex.getMessage());

        // Devolve o erro com o status 400
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erroResponse);
    }
}
