-- Criar ENUM para status de pedido (se não existir)
DO $$ BEGIN
    CREATE TYPE status_pedido_enum AS ENUM ('PENDENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS public.pedido (
  id_pedido SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL,
  data_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  status status_pedido_enum NOT NULL DEFAULT 'PENDENTE',
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS public.pedido_item (
  id_pedido_item SERIAL PRIMARY KEY,
  id_pedido INTEGER NOT NULL,
  id_produto INTEGER,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  preco_unitario NUMERIC(10, 2) NOT NULL CHECK (preco_unitario >= 0),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_pedido_item_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_pedido_item_produto FOREIGN KEY (id_produto) REFERENCES public.produto(id_produto) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pedido_usuario ON public.pedido(id_usuario);
CREATE INDEX IF NOT EXISTS idx_pedido_status ON public.pedido(status);
CREATE INDEX IF NOT EXISTS idx_pedido_data_hora ON public.pedido(data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_item_pedido ON public.pedido_item(id_pedido);
CREATE INDEX IF NOT EXISTS idx_pedido_item_produto ON public.pedido_item(id_produto);

-- Comentários nas tabelas
COMMENT ON TABLE public.pedido IS 'Tabela de pedidos realizados pelos usuários';
COMMENT ON TABLE public.pedido_item IS 'Tabela de itens dentro dos pedidos';

COMMENT ON COLUMN public.pedido.id_pedido IS 'ID único do pedido';
COMMENT ON COLUMN public.pedido.id_usuario IS 'ID do usuário que fez o pedido';
COMMENT ON COLUMN public.pedido.data_hora IS 'Data e hora do pedido';
COMMENT ON COLUMN public.pedido.valor_total IS 'Valor total do pedido';
COMMENT ON COLUMN public.pedido.status IS 'Status atual do pedido';

COMMENT ON COLUMN public.pedido_item.id_pedido_item IS 'ID único do item';
COMMENT ON COLUMN public.pedido_item.id_pedido IS 'ID do pedido ao qual o item pertence';
COMMENT ON COLUMN public.pedido_item.id_produto IS 'ID do produto (pode ser NULL se produto for deletado)';
COMMENT ON COLUMN public.pedido_item.quantidade IS 'Quantidade do produto no pedido';
COMMENT ON COLUMN public.pedido_item.preco_unitario IS 'Preço unitário do produto no momento da compra';
