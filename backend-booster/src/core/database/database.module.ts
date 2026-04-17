import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { LogLevel } from 'typeorm';
import { QueryProfilerService } from './query-profiler.service';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');

        const sharedOptions = {
          autoLoadEntities: true,
          synchronize: false,
          migrations: [],
          migrationsRun: false,
          retryAttempts: 3,
          retryDelay: 1000,
          connectTimeoutMS: 10000,
          // Em dev: loga queries que demoram mais de 200ms
          logging: (isDev ? ['warn', 'error', 'slow'] : ['error']) as LogLevel[],
          maxQueryExecutionTime: isDev ? 200 : undefined,
        };

        // Se DATABASE_URL existir, usa ela (Supabase/produção)
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: {
              rejectUnauthorized: false, // Necessário para Supabase
            },
            ...sharedOptions,
          };
        }

        // Caso contrário, usa variáveis individuais (local)
        return {
          type: 'postgres',
          host: configService.getOrThrow('POSTGRES_HOST'),
          port: configService.getOrThrow('POSTGRES_PORT'),
          database: configService.getOrThrow('POSTGRES_DB'),
          username: configService.getOrThrow('POSTGRES_USER'),
          password: configService.getOrThrow('POSTGRES_PASSWORD'),
          ...sharedOptions,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [QueryProfilerService],
  exports: [QueryProfilerService],
})
export class DatabaseModule {}
