import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameClienteToUser1761535539994 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar o novo enum user_role_enum
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('CLIENT', 'ADMIN')`,
    );

    // 2. Renomear a tabela cliente para user
    await queryRunner.query(`ALTER TABLE "cliente" RENAME TO "user"`);

    // 3. Renomear a coluna id_cliente para id_user
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "id_cliente" TO "id_user"`,
    );

    // 4. Renomear a sequence (auto increment) da primary key
    await queryRunner.query(
      `ALTER SEQUENCE "cliente_id_cliente_seq" RENAME TO "user_id_user_seq"`,
    );

    // 5. Adicionar a coluna role com o novo enum (se ainda não existir)
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'user' AND column_name = 'role'
                ) THEN
                    ALTER TABLE "user" ADD COLUMN "role" "public"."user_role_enum" NOT NULL DEFAULT 'CLIENT';
                END IF;
            END $$;
        `);

    // 6. Se a coluna role já existia com o enum cliente_role_enum, converter para user_role_enum
    await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'user' AND column_name = 'role'
                    AND udt_name = 'cliente_role_enum'
                ) THEN
                    -- Remover o default temporariamente
                    ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;

                    -- Converter a coluna para text
                    ALTER TABLE "user" ALTER COLUMN "role" TYPE text;

                    -- Converter para o novo enum
                    ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."user_role_enum"
                    USING "role"::"public"."user_role_enum";

                    -- Recolocar o default
                    ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'CLIENT';

                    -- Dropar o enum antigo se existir
                    DROP TYPE IF EXISTS "public"."cliente_role_enum";
                END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Recriar o enum antigo (se necessário)
    await queryRunner.query(
      `CREATE TYPE "public"."cliente_role_enum" AS ENUM('CLIENT', 'ADMIN')`,
    );

    // 2. Converter a coluna role de volta para cliente_role_enum (se existir)
    await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'user' AND column_name = 'role'
                ) THEN
                    ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
                    ALTER TABLE "user" ALTER COLUMN "role" TYPE text;
                    ALTER TABLE "user" ALTER COLUMN "role" TYPE "public"."cliente_role_enum"
                    USING "role"::"public"."cliente_role_enum";
                    ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'CLIENT';
                END IF;
            END $$;
        `);

    // 3. Renomear a sequence de volta
    await queryRunner.query(
      `ALTER SEQUENCE "user_id_user_seq" RENAME TO "cliente_id_cliente_seq"`,
    );

    // 4. Renomear a coluna id_user de volta para id_cliente
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "id_user" TO "id_cliente"`,
    );

    // 5. Renomear a tabela de volta para cliente
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "cliente"`);

    // 6. Dropar o enum user_role_enum
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
  }
}
