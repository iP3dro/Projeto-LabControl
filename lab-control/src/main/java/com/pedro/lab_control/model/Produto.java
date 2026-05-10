package com.pedro.lab_control.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tb_produtos")
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false)
    private Integer quantidadeAtual;

    @Column (nullable = false)
    private Integer quantidadeMinima;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    public Produto(){
    }

    public Produto(Long id, String nome, Integer quantidadeAtual, Integer quantidadeMinima,
                   LocalDate dataValidade, Categoria categoria) {
        this.id = id;
        this.nome = nome;
        this.quantidadeAtual = quantidadeAtual;
        this.quantidadeMinima = quantidadeMinima;
        this.dataValidade = dataValidade;
        this.categoria = categoria;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getNome(){
        return nome;
    }

    public void setNome(String nome){
        this.nome = nome;
    }

    public Integer getQuantidadeAtual(){
        return quantidadeAtual;
    }

    public void setQuantidadeAtual(Integer quantidadeAtual){
        this.quantidadeAtual = quantidadeAtual;
    }

    public Integer getQuantidadeMinima(){
        return quantidadeMinima;
    }

    public void setQuantidadeMinima(Integer quantidadeMinima){
        this.quantidadeMinima = quantidadeMinima;
    }

    public LocalDate getDataValidade(){
        return dataValidade;
    }

    public void setDataValidade(LocalDate dataValidade){
        this.dataValidade = dataValidade;
    }

    public Categoria getCategoria(){
        return categoria;
    }

    public void setCategoria(Categoria categoria){
        this.categoria = categoria;
    }
}
