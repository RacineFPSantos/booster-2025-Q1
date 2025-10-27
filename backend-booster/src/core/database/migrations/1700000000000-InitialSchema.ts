import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  TIPO_CLIENTE_VALUES,
  STATUS_PEDIDO_VALUES,
} from '../../../shared/enums/database.enums';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar função para atualizar updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (NEW IS DISTINCT FROM OLD) THEN
          NEW.updated_at = NOW();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 2. Criar ENUM tipo_cliente_enum
    await queryRunner.query(`
      CREATE TYPE tipo_cliente_enum AS ENUM (${TIPO_CLIENTE_VALUES.map((v) => `'${v}'`).join(', ')});
    `);

    // 3. Criar ENUM status_pedido_enum
    await queryRunner.query(`
      CREATE TYPE status_pedido_enum AS ENUM (${STATUS_PEDIDO_VALUES.map((v) => `'${v}'`).join(', ')});
    `);

    // 4. Criar tabela cliente
    await queryRunner.query(`
      CREATE TABLE cliente (
        id_cliente SERIAL PRIMARY KEY,
        documento VARCHAR(14) UNIQUE NOT NULL,
        tipo_cliente tipo_cliente_enum NOT NULL,
        nome VARCHAR(100),
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_cliente_updated_at
        BEFORE UPDATE ON cliente
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // 5. Criar tabela categoria
    await queryRunner.query(`
      CREATE TABLE categoria (
        id_categoria SERIAL PRIMARY KEY,
        nome VARCHAR(50) NOT NULL UNIQUE
      );
    `);

    // 6. Criar tabela fabricante
    await queryRunner.query(`
      CREATE TABLE fabricante (
        id_fabricante SERIAL PRIMARY KEY,
        cnpj VARCHAR(14) UNIQUE NOT NULL,
        nome VARCHAR(100) NOT NULL UNIQUE
      );
    `);

    // 7. Criar tabela produto
    await queryRunner.query(`
      CREATE TABLE produto (
        id_produto SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario >= 0),
        id_categoria INT NOT NULL,
        id_fabricante INT NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

        CONSTRAINT fk_produto_categoria
          FOREIGN KEY (id_categoria)
          REFERENCES categoria(id_categoria),

        CONSTRAINT fk_produto_fabricante
          FOREIGN KEY (id_fabricante)
          REFERENCES fabricante(id_fabricante)
      );
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_produto_updated_at
        BEFORE UPDATE ON produto
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // 8. Criar tabela pedido
    await queryRunner.query(`
      CREATE TABLE pedido (
        id_pedido SERIAL PRIMARY KEY,
        id_cliente INT NOT NULL,
        data_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        valor_total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
        status status_pedido_enum NOT NULL DEFAULT 'PENDENTE',

        CONSTRAINT fk_pedido_cliente
          FOREIGN KEY (id_cliente)
          REFERENCES cliente(id_cliente)
          ON DELETE RESTRICT
      );
    `);

    // 9. Criar tabela pedido_item
    await queryRunner.query(`
      CREATE TABLE pedido_item (
        id_pedido_item SERIAL PRIMARY KEY,
        id_pedido INT NOT NULL,
        id_produto INT NOT NULL,
        quantidade INT NOT NULL,
        preco_unitario DECIMAL(10,2) NOT NULL,

        CONSTRAINT fk_pedido_item_pedido
          FOREIGN KEY (id_pedido)
          REFERENCES pedido(id_pedido),

        CONSTRAINT fk_pedido_item_produto
          FOREIGN KEY (id_produto)
          REFERENCES produto(id_produto)
      );
    `);

    // 10. Criar tabela estoque
    await queryRunner.query(`
      CREATE TABLE estoque (
        id_produto INT PRIMARY KEY,
        quantidade INT NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

        CONSTRAINT fk_estoque_produto
          FOREIGN KEY (id_produto)
          REFERENCES produto(id_produto)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_estoque_updated_at
        BEFORE UPDATE ON estoque
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter na ordem inversa (por causa das foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS estoque CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS pedido_item CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS pedido CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS produto CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS fabricante CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS categoria CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS cliente CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS status_pedido_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_cliente_enum;`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column();`,
    );
  }
}
