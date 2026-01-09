import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisEnabled = configService.get('REDIS_ENABLED') !== 'false';
        
        if (!redisEnabled) {
          // Use in-memory cache if Redis is disabled
          return {
            ttl: 600,
            max: 100,
          };
        }
        
        // Use Redis if enabled
        return {
          store: redisStore,
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
          ttl: 600,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
