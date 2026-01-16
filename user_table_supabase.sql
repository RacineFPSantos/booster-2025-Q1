-- Tabela de usuários (User)
-- Roda este script no SQL Editor do Supabase

CREATE TABLE "user" (
    id_user SERIAL PRIMARY KEY,
    documento VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    tipo_cliente tipo_cliente_enum NOT NULL,
    nome VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER trigger_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE "user" IS 'Tabela de usuários do sistema (clientes e admins)';
COMMENT ON COLUMN "user".documento IS 'CPF ou CNPJ do usuário (único)';
COMMENT ON COLUMN "user".email IS 'Email único do usuário';
COMMENT ON COLUMN "user".senha IS 'Senha hasheada com Argon2';
COMMENT ON COLUMN "user".role IS 'Papel do usuário: CLIENT ou ADMIN';
COMMENT ON COLUMN "user".tipo_cliente IS 'Tipo de cliente: PF ou PJ';
