package com.pedro.lab_control.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_movimentacoes")
public class Movimentacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private LocalDateTime data;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimentacao tipo;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    public Movimentacao(){
    }

    public Movimentacao(Long id, Integer quantidade, LocalDateTime data,
                        TipoMovimentacao tipo, Produto produto){
        this.id = id;
        this.quantidade = quantidade;
        this.data = data;
        this.tipo = tipo;
        this.produto = produto;
    }

    public Long getId(){return id;}
    public void setId(Long id){this.id = id;}

    public Integer getQuantidade(){return quantidade;}
    public void setQuantidade(Integer quantidade){this.quantidade = quantidade;}

    public LocalDateTime getData(){return data;}
    public void setData(LocalDateTime data){this.data = data;}

    public TipoMovimentacao getTipo(){return tipo;}
    public void setTipo(TipoMovimentacao tipo){this.tipo = tipo;}

    public Produto getProduto(){return produto;}
    public void setProduto(Produto produto){this.produto = produto;}

}
