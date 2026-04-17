import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Extensão pgvector e tabela rag_document para o módulo de IA/RAG.
 * Separada do schema principal pois depende da extensão vector do PostgreSQL.
 */
export class EnablePgvector1800000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rag_document (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        source_type VARCHAR(20) NOT NULL,
        source_id   INT         NOT NULL,
        content_text TEXT       NOT NULL,
        embedding   vector(768) NOT NULL,
        metadata    JSONB       NOT NULL DEFAULT '{}',
        indexed_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
        UNIQUE (source_type, source_id)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_rag_document_embedding
        ON rag_document
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS rag_document CASCADE`);
  }
}
