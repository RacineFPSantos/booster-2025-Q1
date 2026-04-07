import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTipoClienteColumn1770100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna tipo_cliente que ficou órfã da tabela original "cliente"
    // A entity User não usa esse campo e ele não tem equivalente na lógica atual
    await queryRunner.query(
      `ALTER TABLE "usuario" DROP COLUMN IF EXISTS "tipo_cliente"`,
    );

    // Remover o enum orphão
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."tipo_cliente_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tipo_cliente_enum" AS ENUM('PF', 'PJ')`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuario" ADD COLUMN "tipo_cliente" "public"."tipo_cliente_enum" NOT NULL DEFAULT 'PF'`,
    );
  }
}
