import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schema completo e consolidado.
 * Reflete o estado atual de todos os entities.
 */
export class InitialSchema1800000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // -------------------------------------------------------------------------
    // Função de atualização automática de updated_at
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (NEW IS DISTINCT FROM OLD) THEN
          NEW.updated_at = NOW();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // -------------------------------------------------------------------------
    // ENUMs
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TYPE usuario_role_enum AS ENUM ('CLIENT', 'ADMIN')
    `);

    await queryRunner.query(`
      CREATE TYPE status_pedido_enum AS ENUM (
        'PENDENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'
      )
    `);

    // -------------------------------------------------------------------------
    // usuario
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE usuario (
        id_usuario    SERIAL PRIMARY KEY,
        documento     VARCHAR(14)          UNIQUE NOT NULL,
        email         VARCHAR(100)         UNIQUE NOT NULL,
        password_hash VARCHAR(255)         NOT NULL,
        nome          VARCHAR(100)         NOT NULL,
        usuario_role  usuario_role_enum    NOT NULL DEFAULT 'CLIENT',
        is_active     BOOLEAN              NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_usuario_updated_at
        BEFORE UPDATE ON usuario
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // -------------------------------------------------------------------------
    // categoria
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE categoria (
        id_categoria SERIAL PRIMARY KEY,
        nome         VARCHAR(50) UNIQUE NOT NULL
      )
    `);

    // -------------------------------------------------------------------------
    // fabricante
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE fabricante (
        id_fabricante SERIAL PRIMARY KEY,
        cnpj          VARCHAR(14)  UNIQUE NOT NULL,
        nome          VARCHAR(100) UNIQUE NOT NULL
      )
    `);

    // -------------------------------------------------------------------------
    // produto
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE produto (
        id_produto      SERIAL PRIMARY KEY,
        nome            VARCHAR(100)        NOT NULL,
        descricao       TEXT,
        imagem_url      VARCHAR(255),
        preco_unitario  DECIMAL(10,2)       NOT NULL CHECK (preco_unitario >= 0),
        id_categoria    INT                 NOT NULL,
        id_fabricante   INT                 NOT NULL,
        created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_produto_categoria
          FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
          ON DELETE RESTRICT,
        CONSTRAINT fk_produto_fabricante
          FOREIGN KEY (id_fabricante) REFERENCES fabricante(id_fabricante)
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_produto_updated_at
        BEFORE UPDATE ON produto
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // -------------------------------------------------------------------------
    // carrinho
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE carrinho (
        id_carrinho SERIAL PRIMARY KEY,
        id_usuario  INT NOT NULL,
        created_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_carrinho_usuario
          FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_carrinho_updated_at
        BEFORE UPDATE ON carrinho
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // -------------------------------------------------------------------------
    // carrinho_item
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE carrinho_item (
        id_carrinho_item SERIAL PRIMARY KEY,
        id_carrinho      INT           NOT NULL,
        id_produto       INT           NOT NULL,
        quantidade       INT           NOT NULL DEFAULT 1,
        preco_unitario   DECIMAL(10,2) NOT NULL,
        created_at       TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_carrinho_item_carrinho
          FOREIGN KEY (id_carrinho) REFERENCES carrinho(id_carrinho)
          ON DELETE CASCADE,
        CONSTRAINT fk_carrinho_item_produto
          FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_carrinho_item_updated_at
        BEFORE UPDATE ON carrinho_item
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // -------------------------------------------------------------------------
    // pedido
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE pedido (
        id_pedido   SERIAL PRIMARY KEY,
        id_cliente  INT                  NOT NULL,
        data_hora   TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        valor_total DECIMAL(10,2)        NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
        status      status_pedido_enum   NOT NULL DEFAULT 'PENDENTE',
        created_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_pedido_cliente
          FOREIGN KEY (id_cliente) REFERENCES usuario(id_usuario)
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_pedido_updated_at
        BEFORE UPDATE ON pedido
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // -------------------------------------------------------------------------
    // pedido_item
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE pedido_item (
        id_pedido_item SERIAL PRIMARY KEY,
        id_pedido      INT           NOT NULL,
        id_produto     INT           NOT NULL,
        quantidade     INT           NOT NULL DEFAULT 1,
        preco_unitario DECIMAL(10,2) NOT NULL,
        created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_pedido_item_pedido
          FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
          ON DELETE CASCADE,
        CONSTRAINT fk_pedido_item_produto
          FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
          ON DELETE RESTRICT
      )
    `);

    // -------------------------------------------------------------------------
    // rooms (chat)
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE rooms (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id VARCHAR     NOT NULL,
        admin_id    VARCHAR,
        status      VARCHAR     NOT NULL DEFAULT 'waiting',
        created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
      )
    `);

    // -------------------------------------------------------------------------
    // messages (chat)
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE messages (
        id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id    UUID      NOT NULL,
        sender_id  VARCHAR   NOT NULL,
        content    TEXT      NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_messages_room
          FOREIGN KEY (room_id) REFERENCES rooms(id)
          ON DELETE CASCADE
      )
    `);

    // -------------------------------------------------------------------------
    // tipo_servico
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE tipo_servico (
        id_tipo_servico SERIAL PRIMARY KEY,
        nome            VARCHAR(100) NOT NULL,
        descricao       TEXT,
        created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_tipo_servico_updated_at
        BEFORE UPDATE ON tipo_servico
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // -------------------------------------------------------------------------
    // servico
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE servico (
        id_servico        SERIAL PRIMARY KEY,
        nome              VARCHAR(100)  NOT NULL,
        descricao         TEXT,
        preco             DECIMAL(10,2) NOT NULL,
        duracao_estimada  INT           NOT NULL,
        id_tipo_servico   INT           NOT NULL,
        ativo             BOOLEAN       NOT NULL DEFAULT TRUE,
        created_at        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_servico_tipo
          FOREIGN KEY (id_tipo_servico) REFERENCES tipo_servico(id_tipo_servico)
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_servico_updated_at
        BEFORE UPDATE ON servico
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // -------------------------------------------------------------------------
    // agendamento
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE agendamento (
        id_agendamento  SERIAL PRIMARY KEY,
        id_servico      INT          NOT NULL,
        id_usuario      INT,
        data_agendamento DATE        NOT NULL,
        hora_agendamento TIME        NOT NULL,
        telefone        VARCHAR(20)  NOT NULL,
        veiculo         VARCHAR(200) NOT NULL,
        observacoes     TEXT,
        status          VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE',
        created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_agendamento_servico
          FOREIGN KEY (id_servico) REFERENCES servico(id_servico)
          ON DELETE RESTRICT,
        CONSTRAINT fk_agendamento_usuario
          FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_agendamento_updated_at
        BEFORE UPDATE ON agendamento
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // -------------------------------------------------------------------------
    // ai_interaction_log
    // -------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE ai_interaction_log (
        id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id                INT,
        session_id             VARCHAR(100),
        prompt_text            TEXT         NOT NULL,
        system_prompt_version  VARCHAR(20)  NOT NULL,
        response_text          TEXT         NOT NULL,
        intent_detected        VARCHAR(50),
        input_tokens           INT,
        output_tokens          INT,
        total_tokens           INT,
        model_used             VARCHAR(100) NOT NULL,
        latency_ms             INT          NOT NULL,
        was_filtered           BOOLEAN      NOT NULL DEFAULT FALSE,
        created_at             TIMESTAMP    NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_ai_log_usuario
          FOREIGN KEY (user_id) REFERENCES usuario(id_usuario)
          ON DELETE SET NULL
      )
    `);

    // -------------------------------------------------------------------------
    // Indexes de performance
    // -------------------------------------------------------------------------

    // pedido
    await queryRunner.query(`CREATE INDEX idx_pedido_created_at_status ON pedido(created_at DESC, status)`);
    await queryRunner.query(`CREATE INDEX idx_pedido_id_cliente_created_at ON pedido(id_cliente, created_at DESC)`);

    // carrinho
    await queryRunner.query(`CREATE INDEX idx_carrinho_id_usuario ON carrinho(id_usuario)`);

    // produto
    await queryRunner.query(`CREATE INDEX idx_produto_categoria_fabricante ON produto(id_categoria, id_fabricante)`);

    // rooms / messages
    await queryRunner.query(`CREATE INDEX idx_rooms_status_created_at ON rooms(status, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_messages_room_id_created_at ON messages(room_id, created_at DESC)`);

    // agendamento
    await queryRunner.query(`CREATE INDEX idx_agendamento_id_usuario_data ON agendamento(id_usuario, data_agendamento)`);
    await queryRunner.query(`CREATE INDEX idx_agendamento_status_data ON agendamento(status, data_agendamento)`);

    // usuario
    await queryRunner.query(`CREATE INDEX idx_usuario_role ON usuario(usuario_role)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ai_interaction_log CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS agendamento CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS servico CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS tipo_servico CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS messages CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS rooms CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS pedido_item CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS pedido CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS carrinho_item CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS carrinho CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS produto CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS fabricante CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS categoria CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuario CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS status_pedido_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS usuario_role_enum`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
  }
}
