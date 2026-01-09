import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { ProductivityModule } from './modules/productivity/productivity.module';
import { JournalModule } from './modules/journal/journal.module';
import { LimiterModule } from './modules/limiter/limiter.module';
import { AiModule } from './modules/ai/ai.module';
import { VectorMemoryModule } from './shared/vector-memory/vector-memory.module';
import { SquadModule } from './modules/squad/squad.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    RedisModule,
    VectorMemoryModule,
    AuthModule,
    HealthModule,
    TrackingModule,
    ProductivityModule,
    JournalModule,
    LimiterModule,
    AiModule,
    SquadModule,
    ProfileModule,
  ],
})
export class AppModule {}
