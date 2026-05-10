package com.pedro.lab_control.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_categorias")
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //banco de dados vai gerar o ID automaticamente
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    public Categoria(){
    }

    public Categoria(Long id, String nome) {
        this.id = id;
        this.nome = nome;
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

}
