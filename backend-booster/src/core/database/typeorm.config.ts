import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['src/**/*.entity.{ts,js}'],
  migrations: ['src/core/database/migrations/*.{ts,js}'],
  synchronize: false, // SEMPRE false em produção
});
