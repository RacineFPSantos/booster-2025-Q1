import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameClienteToUser1761535539994 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar o enum usuario_role_enum
    await queryRunner.query(
      `CREATE TYPE "public"."usuario_role_enum" AS ENUM('CLIENT', 'ADMIN')`,
    );

    // 2. Renomear a tabela cliente para usuario
    await queryRunner.query(`ALTER TABLE "cliente" RENAME TO "usuario"`);

    // 3. Renomear a coluna id_cliente para id_usuario
    await queryRunner.query(
      `ALTER TABLE "usuario" RENAME COLUMN "id_cliente" TO "id_usuario"`,
    );

    // 4. Renomear a sequence (auto increment) da primary key
    await queryRunner.query(
      `ALTER SEQUENCE "cliente_id_cliente_seq" RENAME TO "usuario_id_usuario_seq"`,
    );

    // 5. Renomear coluna senha para password_hash
    await queryRunner.query(
      `ALTER TABLE "usuario" RENAME COLUMN "senha" TO "password_hash"`,
    );

    // 6. Adicionar coluna is_active
    await queryRunner.query(`
      ALTER TABLE "usuario" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true;
    `);

    // 7. Converter coluna role para usuario_role usando usuario_role_enum
    await queryRunner.query(`
      ALTER TABLE "usuario" ALTER COLUMN "role" DROP DEFAULT;
      ALTER TABLE "usuario" ALTER COLUMN "role" TYPE text;
      ALTER TABLE "usuario" ALTER COLUMN "role" TYPE "public"."usuario_role_enum"
        USING "role"::"public"."usuario_role_enum";
      ALTER TABLE "usuario" ALTER COLUMN "role" SET DEFAULT 'CLIENT';
    `);

    await queryRunner.query(
      `ALTER TABLE "usuario" RENAME COLUMN "role" TO "usuario_role"`,
    );

    // 8. Dropar enum antigo
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."cliente_role_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Recriar o enum antigo
    await queryRunner.query(
      `CREATE TYPE "public"."cliente_role_enum" AS ENUM('CLIENT', 'ADMIN')`,
    );

    // 2. Reverter coluna usuario_role para role com cliente_role_enum
    await queryRunner.query(
      `ALTER TABLE "usuario" RENAME COLUMN "usuario_role" TO "role"`,
    );
    await queryRunner.query(`
      ALTER TABLE "usuario" ALTER COLUMN "role" DROP DEFAULT;
      ALTER TABLE "usuario" ALTER COLUMN "role" TYPE text;
      ALTER TABLE "usuario" ALTER COLUMN "role" TYPE "public"."cliente_role_enum"
        USING "role"::"public"."cliente_role_enum";
      ALTER TABLE "usuario" ALTER COLUMN "role" SET DEFAULT 'CLIENT';
    `);

    // 3. Remover is_active
    await queryRunner.query(
      `ALTER TABLE "usuario" DROP COLUMN IF EXISTS "is_active"`,
    );

    // 4. Renomear password_hash de volta para senha
    await queryRunner.query(
      `ALTER TABLE "usuario" RENAME COLUMN "password_hash" TO "senha"`,
    );

    // 5. Renomear a sequence de volta
    await queryRunner.query(
      `ALTER SEQUENCE "usuario_id_usuario_seq" RENAME TO "cliente_id_cliente_seq"`,
    );

    // 6. Renomear a coluna id_usuario de volta para id_cliente
    await queryRunner.query(
      `ALTER TABLE "usuario" RENAME COLUMN "id_usuario" TO "id_cliente"`,
    );

    // 7. Renomear a tabela de volta para cliente
    await queryRunner.query(`ALTER TABLE "usuario" RENAME TO "cliente"`);

    // 8. Dropar o enum usuario_role_enum
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."usuario_role_enum"`);
  }
}
