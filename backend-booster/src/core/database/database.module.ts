import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');

        // Se DATABASE_URL existir, usa ela (Supabase/produção)
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: false,
            migrations: ['dist/databases/migrations/*.js'],
            migrationsRun: false,
            ssl: {
              rejectUnauthorized: false, // Necessário para Supabase
            },
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
          autoLoadEntities: true,
          synchronize: false,
          migrations: ['dist/databases/migrations/*.js'],
          migrationsRun: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
