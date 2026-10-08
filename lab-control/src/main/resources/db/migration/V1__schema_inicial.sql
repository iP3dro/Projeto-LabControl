CREATE TABLE tb_categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE tb_produtos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    quantidade_atual INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER NOT NULL,
    categoria_id BIGINT NOT NULL,
    CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id) REFERENCES tb_categorias (id)
);

CREATE TABLE tb_lotes (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL,
    quantidade INTEGER NOT NULL,
    data_validade DATE,
    data_entrada TIMESTAMP NOT NULL,
    CONSTRAINT fk_lote_produto FOREIGN KEY (produto_id) REFERENCES tb_produtos (id)
);

CREATE TABLE tb_movimentacoes (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL,
    lote_id BIGINT,
    quantidade INTEGER NOT NULL,
    data TIMESTAMP NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    usuario_uid VARCHAR(128),
    usuario_email VARCHAR(255),
    CONSTRAINT fk_movimentacao_produto FOREIGN KEY (produto_id) REFERENCES tb_produtos (id),
    CONSTRAINT fk_movimentacao_lote FOREIGN KEY (lote_id) REFERENCES tb_lotes (id)
);

CREATE INDEX idx_produto_categoria ON tb_produtos (categoria_id);
CREATE INDEX idx_lote_produto ON tb_lotes (produto_id);
CREATE INDEX idx_lote_validade ON tb_lotes (data_validade);
CREATE INDEX idx_movimentacao_produto ON tb_movimentacoes (produto_id);
CREATE INDEX idx_movimentacao_data ON tb_movimentacoes (data);
