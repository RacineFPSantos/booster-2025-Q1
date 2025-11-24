-- Database schema para o a aplicação Booster CarAI (Supabase)

-- ============================================
-- FUNÇÃO AUXILIAR (deve vir PRIMEIRO)
-- ============================================

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

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE tipo_cliente_enum AS ENUM ('PF', 'PJ');

CREATE TYPE status_pedido_enum AS ENUM (
    'PENDENTE',
    'CONFIRMADO',
    'ENVIADO',
    'ENTREGUE',
    'CANCELADO'
);

CREATE TYPE status_agendamento_enum AS ENUM (
    'PENDENTE',
    'CONFIRMADO',
    'EM_ANDAMENTO',
    'CONCLUIDO',
    'CANCELADO'
);

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

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

-- ============================================
-- TABELAS DE SERVIÇOS
-- ============================================

CREATE TABLE tipo_servico (
    id_tipo_servico SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_tipo_servico_updated_at
    BEFORE UPDATE ON tipo_servico
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE servico (
    id_servico SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    duracao_estimada INT NOT NULL CHECK (duracao_estimada > 0), -- em minutos
    id_tipo_servico INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Chave estrangeira
    CONSTRAINT fk_servico_tipo_servico
        FOREIGN KEY (id_tipo_servico)
        REFERENCES tipo_servico(id_tipo_servico)
        ON DELETE RESTRICT
);

CREATE TRIGGER trigger_servico_updated_at
    BEFORE UPDATE ON servico
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de agendamento de serviços
CREATE TABLE agendamento (
    id_agendamento SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_servico INT NOT NULL,
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    observacoes TEXT,
    status status_agendamento_enum NOT NULL DEFAULT 'PENDENTE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Chaves estrangeiras
    CONSTRAINT fk_agendamento_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente)
        ON DELETE RESTRICT,

    CONSTRAINT fk_agendamento_servico
        FOREIGN KEY (id_servico)
        REFERENCES servico(id_servico)
        ON DELETE RESTRICT,

    -- Não permitir dois agendamentos no mesmo horário
    CONSTRAINT uk_agendamento_data_hora
        UNIQUE (data_agendamento, hora_agendamento)
);

CREATE TRIGGER trigger_agendamento_updated_at
    BEFORE UPDATE ON agendamento
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE pedido_item (
    id_pedido_item SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_produto INT NULL,
    id_servico INT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario >= 0),

    -- Um pedido_item deve ter OU produto OU serviço, mas não ambos
    CONSTRAINT chk_produto_ou_servico
        CHECK ((id_produto IS NOT NULL AND id_servico IS NULL) OR
               (id_produto IS NULL AND id_servico IS NOT NULL)),

    -- Chave estrangeira para pedido
    CONSTRAINT fk_pedido_item_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido)
        ON DELETE CASCADE,

    -- FK para produto
    CONSTRAINT fk_pedido_item_produto
        FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto)
        ON DELETE RESTRICT,

    -- FK para servico
    CONSTRAINT fk_pedido_item_servico
        FOREIGN KEY (id_servico)
        REFERENCES servico(id_servico)
        ON DELETE RESTRICT
);

-- ============================================
-- TABELA DE ESTOQUE (PRODUTOS)
-- ============================================

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

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE pedido IS 'Tabela de pedidos que pode conter produtos e/ou serviços';
COMMENT ON TABLE pedido_item IS 'Itens do pedido - pode ser produto OU serviço (não ambos)';
COMMENT ON COLUMN pedido_item.id_produto IS 'ID do produto (NULL se for serviço)';
COMMENT ON COLUMN pedido_item.id_servico IS 'ID do serviço (NULL se for produto)';
COMMENT ON COLUMN pedido_item.quantidade IS 'Quantidade do item (normalmente 1 para serviços)';

COMMENT ON TABLE servico IS 'Catálogo de serviços oferecidos pela oficina';
COMMENT ON COLUMN servico.duracao_estimada IS 'Duração estimada do serviço em minutos';
COMMENT ON COLUMN servico.ativo IS 'Indica se o serviço está disponível para agendamento';

COMMENT ON TABLE agendamento IS 'Agendamentos de serviços dos clientes';
COMMENT ON CONSTRAINT uk_agendamento_data_hora ON agendamento IS 'Garante que não há dois agendamentos no mesmo horário';
