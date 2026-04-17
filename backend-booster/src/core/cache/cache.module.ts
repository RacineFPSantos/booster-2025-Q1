import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisHost = configService.get<string>('REDIS_HOST');

        if (!redisUrl && !redisHost) {
          return {};
        }

        const port = configService.get<number>('REDIS_PORT', 6379);
        const { default: KeyvRedis } = await import('@keyv/redis');

        return {
          stores: [new KeyvRedis(redisUrl ?? `redis://${redisHost}:${port}`)],
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
})
export class AppCacheModule {}
