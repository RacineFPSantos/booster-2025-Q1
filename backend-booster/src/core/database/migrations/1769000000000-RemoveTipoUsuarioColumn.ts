import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTipoUsuarioColumn1769000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove a coluna duplicada tipo_usuario, mantendo apenas usuario_role
    await queryRunner.query(
      `ALTER TABLE "usuario" DROP COLUMN IF EXISTS "tipo_usuario"`,
    );

    // Remove o enum orphão
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."tipo_usuario_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recria o enum
    await queryRunner.query(
      `CREATE TYPE "public"."tipo_usuario_enum" AS ENUM('CLIENT', 'ADMIN')`,
    );

    // Recria a coluna com valor padrão baseado em usuario_role
    await queryRunner.query(
      `ALTER TABLE "usuario" ADD COLUMN "tipo_usuario" "public"."tipo_usuario_enum" NOT NULL DEFAULT 'CLIENT'`,
    );

    // Sincroniza os dados com usuario_role
    await queryRunner.query(
      `UPDATE "usuario" SET "tipo_usuario" = "usuario_role"`,
    );
  }
}
