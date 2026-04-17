import { AppDataSource } from '../typeorm.config';
import { seedCatalogo } from './seed-catalogo';
import { seedUsuarios } from './seed-usuarios';
import { seedPedidos } from './seed-pedidos';

async function run() {
  console.log('🔌 Conectando ao banco...');
  await AppDataSource.initialize();

  await seedCatalogo(AppDataSource);
  await seedUsuarios(AppDataSource);
  await seedPedidos(AppDataSource);

  await AppDataSource.destroy();

  console.log('🎉 Seed completo!');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
