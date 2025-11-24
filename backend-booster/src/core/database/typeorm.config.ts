import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

// Configuração flexível: aceita DATABASE_URL (Supabase) ou variáveis separadas (local)
export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: ['src/**/*.entity.{ts,js}'],
        migrations: ['src/core/database/migrations/*.{ts,js}'],
        synchronize: false, // SEMPRE false em produção
        ssl: {
          rejectUnauthorized: false, // Necessário para Supabase
        },
      }
    : {
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        entities: ['src/**/*.entity.{ts,js}'],
        migrations: ['src/core/database/migrations/*.{ts,js}'],
        synchronize: false, // SEMPRE false em produção
      },
);
