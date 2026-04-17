import { DataSource } from 'typeorm';
import { fakerPT_BR as faker } from '@faker-js/faker';

const TOTAL = 1000;
const BATCH_SIZE = 500;

const PASSWORD_HASH = '$argon2id$v=19$m=65536,t=3,p=4$seed_hash_placeholder';

function gerarCPFUnico(index: number): string {
  return (10000000000 + index).toString();
}

export async function seedUsuarios(dataSource: DataSource): Promise<void> {
  console.log('🧹 Limpando tabela usuario...');

  await dataSource.query(`DELETE FROM usuario`);

  console.log('👤 Gerando usuários...');

  let values: any[] = [];
  let placeholders: string[] = [];

  let paramIndex = 1;

  for (let i = 1; i <= TOTAL; i++) {
    const nome = faker.person.fullName();

    const email = `user${i}@booster.dev`;

    const documento = gerarCPFUnico(i);

    const role = i <= 5 ? 'ADMIN' : 'CLIENT';

    values.push(documento, email, PASSWORD_HASH, nome, role, true);

    placeholders.push(
      `($${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++})`,
    );

    if (i % BATCH_SIZE === 0) {
      await dataSource.query(
        `
INSERT INTO usuario
(documento,email,password_hash,nome,usuario_role,is_active)
VALUES
${placeholders.join(',')}
`,
        values,
      );

      console.log(`Inseridos ${i}/${TOTAL}`);

      values = [];
      placeholders = [];
      paramIndex = 1;
    }
  }

  if (values.length > 0) {
    await dataSource.query(
      `
INSERT INTO usuario
(documento,email,password_hash,nome,usuario_role,is_active)
VALUES
${placeholders.join(',')}
`,
      values,
    );
  }

  console.log('✅ seedUsuarios finalizado');
}
