-- Database schema para o a aplicação Booster CarAI

CREATE TYPE tipo_cliente_enum AS ENUM ('PF', 'PJ');

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    documento VARCHAR(14) UNIQUE NOT NULL,
	tipo_cliente tipo_cliente_enum NOT NULL,
    nome VARCHAR(100),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_cliente_updated_at
    BEFORE UPDATE ON cliente
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TYPE status_pedido_enum AS ENUM (
    'PENDENTE',
    'CONFIRMADO',
    'ENVIADO',
    'ENTREGUE',
    'CANCELADO'
);

CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
    status status_pedido_enum NOT NULL DEFAULT 'PENDENTE',

    -- Chave estrangeira
    CONSTRAINT fk_pedido_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente)
        ON DELETE RESTRICT
);

CREATE TABLE pedido_item (
    id_pedido_item SERIAL PRIMARY KEY,
    id_pedido INT REFERENCES pedido(id_pedido),
    id_produto INT,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL
);

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE fabricante (
    id_fabricante SERIAL PRIMARY KEY,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE produto (
    id_produto SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario >= 0),
    id_categoria INT NOT NULL,
    id_fabricante INT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints para garantir integridade
    CONSTRAINT fk_produto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria),

    CONSTRAINT fk_produto_fabricante
        FOREIGN KEY (id_fabricante)
        REFERENCES fabricante(id_fabricante)
);

CREATE TRIGGER trigger_produto_updated_at
    BEFORE UPDATE ON produto
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE estoque (
    id_produto INT PRIMARY KEY,
    quantidade INT NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Chave estrangeira para produto
    CONSTRAINT fk_estoque_produto
        FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto)
        ON DELETE CASCADE
);

CREATE TRIGGER trigger_estoque_updated_at
    BEFORE UPDATE ON estoque
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Só atualiza se realmente houve mudança nos dados
    IF (NEW IS DISTINCT FROM OLD) THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
