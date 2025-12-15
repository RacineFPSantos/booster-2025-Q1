-- Tabela de Carrinho
CREATE TABLE IF NOT EXISTS public.carrinho (
  id_carrinho SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_carrinho_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT unique_carrinho_usuario UNIQUE (id_usuario)
);

-- Tabela de Itens do Carrinho
CREATE TABLE IF NOT EXISTS public.carrinho_item (
  id_carrinho_item SERIAL PRIMARY KEY,
  id_carrinho INTEGER NOT NULL,
  id_produto INTEGER NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  preco_unitario NUMERIC(10, 2) NOT NULL CHECK (preco_unitario >= 0),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_carrinho_item_carrinho FOREIGN KEY (id_carrinho) REFERENCES public.carrinho(id_carrinho) ON DELETE CASCADE,
  CONSTRAINT fk_carrinho_item_produto FOREIGN KEY (id_produto) REFERENCES public.produto(id_produto) ON DELETE CASCADE,
  CONSTRAINT unique_carrinho_produto UNIQUE (id_carrinho, id_produto)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_carrinho_usuario ON public.carrinho(id_usuario);
CREATE INDEX IF NOT EXISTS idx_carrinho_item_carrinho ON public.carrinho_item(id_carrinho);
CREATE INDEX IF NOT EXISTS idx_carrinho_item_produto ON public.carrinho_item(id_produto);

-- Comentários nas tabelas
COMMENT ON TABLE public.carrinho IS 'Tabela de carrinhos de compra dos usuários';
COMMENT ON TABLE public.carrinho_item IS 'Tabela de itens dentro dos carrinhos';

COMMENT ON COLUMN public.carrinho.id_carrinho IS 'ID único do carrinho';
COMMENT ON COLUMN public.carrinho.id_usuario IS 'ID do usuário dono do carrinho';
COMMENT ON COLUMN public.carrinho_item.id_carrinho_item IS 'ID único do item';
COMMENT ON COLUMN public.carrinho_item.id_carrinho IS 'ID do carrinho ao qual o item pertence';
COMMENT ON COLUMN public.carrinho_item.id_produto IS 'ID do produto';
COMMENT ON COLUMN public.carrinho_item.quantidade IS 'Quantidade do produto no carrinho';
COMMENT ON COLUMN public.carrinho_item.preco_unitario IS 'Preço unitário do produto no momento da adição';
