-- Current Supabase schema for the NestJS backend.
-- This file follows the current TypeORM entities in backend-booster/src/api.
-- It intentionally does not create legacy tables: cliente, "user", estoque.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW IS DISTINCT FROM OLD) THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'usuario_role_enum') THEN
    CREATE TYPE public.usuario_role_enum AS ENUM ('CLIENT', 'ADMIN');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pedido_enum') THEN
    CREATE TYPE public.status_pedido_enum AS ENUM (
      'PENDENTE',
      'CONFIRMADO',
      'ENVIADO',
      'ENTREGUE',
      'CANCELADO'
    );
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.usuario (
  id_usuario SERIAL PRIMARY KEY,
  documento VARCHAR NOT NULL UNIQUE,
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  nome VARCHAR NOT NULL,
  usuario_role public.usuario_role_enum NOT NULL DEFAULT 'CLIENT',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_usuario_updated_at ON public.usuario;
CREATE TRIGGER trg_usuario_updated_at
  BEFORE UPDATE ON public.usuario
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.categoria (
  id_categoria SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.fabricante (
  id_fabricante SERIAL PRIMARY KEY,
  cnpj VARCHAR(14) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.produto (
  id_produto SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  imagem_url VARCHAR(255),
  preco_unitario NUMERIC(10, 2) NOT NULL,
  id_categoria INT NOT NULL,
  id_fabricante INT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_produto_categoria
    FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria)
    ON DELETE RESTRICT,
  CONSTRAINT fk_produto_fabricante
    FOREIGN KEY (id_fabricante) REFERENCES public.fabricante(id_fabricante)
    ON DELETE RESTRICT
);

DROP TRIGGER IF EXISTS trg_produto_updated_at ON public.produto;
CREATE TRIGGER trg_produto_updated_at
  BEFORE UPDATE ON public.produto
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.carrinho (
  id_carrinho SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_carrinho_usuario
    FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
    ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trg_carrinho_updated_at ON public.carrinho;
CREATE TRIGGER trg_carrinho_updated_at
  BEFORE UPDATE ON public.carrinho
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.carrinho_item (
  id_carrinho_item SERIAL PRIMARY KEY,
  id_carrinho INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_carrinho_item_carrinho
    FOREIGN KEY (id_carrinho) REFERENCES public.carrinho(id_carrinho)
    ON DELETE CASCADE,
  CONSTRAINT fk_carrinho_item_produto
    FOREIGN KEY (id_produto) REFERENCES public.produto(id_produto)
    ON DELETE RESTRICT
);

DROP TRIGGER IF EXISTS trg_carrinho_item_updated_at ON public.carrinho_item;
CREATE TRIGGER trg_carrinho_item_updated_at
  BEFORE UPDATE ON public.carrinho_item
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.pedido (
  id_pedido SERIAL PRIMARY KEY,
  id_cliente INT NOT NULL,
  data_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status public.status_pedido_enum NOT NULL DEFAULT 'PENDENTE',
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_pedido_cliente
    FOREIGN KEY (id_cliente) REFERENCES public.usuario(id_usuario)
    ON DELETE RESTRICT
);

DROP TRIGGER IF EXISTS trg_pedido_updated_at ON public.pedido;
CREATE TRIGGER trg_pedido_updated_at
  BEFORE UPDATE ON public.pedido
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.pedido_item (
  id_pedido_item SERIAL PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_pedido_item_pedido
    FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido)
    ON DELETE CASCADE,
  CONSTRAINT fk_pedido_item_produto
    FOREIGN KEY (id_produto) REFERENCES public.produto(id_produto)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR NOT NULL,
  admin_id VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  sender_id VARCHAR NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_messages_room
    FOREIGN KEY (room_id) REFERENCES public.rooms(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.tipo_servico (
  id_tipo_servico SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_tipo_servico_updated_at ON public.tipo_servico;
CREATE TRIGGER trg_tipo_servico_updated_at
  BEFORE UPDATE ON public.tipo_servico
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.servico (
  id_servico SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco NUMERIC(10, 2) NOT NULL,
  duracao_estimada INT NOT NULL,
  id_tipo_servico INT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_servico_tipo
    FOREIGN KEY (id_tipo_servico) REFERENCES public.tipo_servico(id_tipo_servico)
    ON DELETE RESTRICT
);

DROP TRIGGER IF EXISTS trg_servico_updated_at ON public.servico;
CREATE TRIGGER trg_servico_updated_at
  BEFORE UPDATE ON public.servico
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.agendamento (
  id_agendamento SERIAL PRIMARY KEY,
  id_servico INT NOT NULL,
  id_usuario INT,
  data_agendamento DATE NOT NULL,
  hora_agendamento TIME NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  veiculo VARCHAR(200) NOT NULL,
  observacoes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_agendamento_servico
    FOREIGN KEY (id_servico) REFERENCES public.servico(id_servico)
    ON DELETE RESTRICT,
  CONSTRAINT fk_agendamento_usuario
    FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
    ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS trg_agendamento_updated_at ON public.agendamento;
CREATE TRIGGER trg_agendamento_updated_at
  BEFORE UPDATE ON public.agendamento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ai_interaction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT,
  session_id VARCHAR(100),
  prompt_text TEXT NOT NULL,
  system_prompt_version VARCHAR(20) NOT NULL,
  response_text TEXT NOT NULL,
  intent_detected VARCHAR(50),
  input_tokens INT,
  output_tokens INT,
  total_tokens INT,
  model_used VARCHAR(100) NOT NULL,
  latency_ms INT NOT NULL,
  was_filtered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_ai_log_usuario
    FOREIGN KEY (user_id) REFERENCES public.usuario(id_usuario)
    ON DELETE SET NULL
);

-- Optional RAG schema. Requires the vector extension enabled in Supabase.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.rag_document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(20) NOT NULL,
  source_id INT NOT NULL,
  content_text TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  indexed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_rag_document_embedding
  ON public.rag_document
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_usuario_role ON public.usuario(usuario_role);
CREATE INDEX IF NOT EXISTS idx_produto_categoria_fabricante ON public.produto(id_categoria, id_fabricante);
CREATE INDEX IF NOT EXISTS idx_carrinho_id_usuario ON public.carrinho(id_usuario);
CREATE INDEX IF NOT EXISTS idx_carrinho_item_id_carrinho ON public.carrinho_item(id_carrinho);
CREATE INDEX IF NOT EXISTS idx_carrinho_item_id_produto ON public.carrinho_item(id_produto);
CREATE INDEX IF NOT EXISTS idx_pedido_created_at_status ON public.pedido(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_pedido_id_cliente_created_at ON public.pedido(id_cliente, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_item_id_pedido ON public.pedido_item(id_pedido);
CREATE INDEX IF NOT EXISTS idx_pedido_item_id_produto ON public.pedido_item(id_produto);
CREATE INDEX IF NOT EXISTS idx_rooms_status_created_at ON public.rooms(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_room_id_created_at ON public.messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agendamento_id_usuario_data ON public.agendamento(id_usuario, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamento_status_data ON public.agendamento(status, data_agendamento);
