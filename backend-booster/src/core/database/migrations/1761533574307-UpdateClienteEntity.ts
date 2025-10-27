import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateClienteEntity1761533574307 implements MigrationInterface {
  name = 'UpdateClienteEntity1761533574307';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "produto" DROP CONSTRAINT "fk_produto_categoria"`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" DROP CONSTRAINT "fk_produto_fabricante"`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" DROP CONSTRAINT "produto_preco_unitario_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD "email" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD "senha" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cliente_role_enum" AS ENUM('CLIENT', 'ADMIN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD "role" "public"."cliente_role_enum" NOT NULL DEFAULT 'CLIENT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" ADD CONSTRAINT "FK_b4b4301786e895495ebff7687a8" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" ADD CONSTRAINT "FK_b64fd3ac225ef6657746ba3b37c" FOREIGN KEY ("id_fabricante") REFERENCES "fabricante"("id_fabricante") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "produto" DROP CONSTRAINT "FK_b64fd3ac225ef6657746ba3b37c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" DROP CONSTRAINT "FK_b4b4301786e895495ebff7687a8"`,
    );
    await queryRunner.query(`ALTER TABLE "cliente" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."cliente_role_enum"`);
    await queryRunner.query(`ALTER TABLE "cliente" DROP COLUMN "senha"`);
    await queryRunner.query(`ALTER TABLE "cliente" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "produto" ADD CONSTRAINT "produto_preco_unitario_check" CHECK ((preco_unitario >= (0)::numeric))`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" ADD CONSTRAINT "fk_produto_fabricante" FOREIGN KEY ("id_fabricante") REFERENCES "fabricante"("id_fabricante") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" ADD CONSTRAINT "fk_produto_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
