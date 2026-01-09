import { Module } from '@nestjs/common';
import { LimiterController } from './limiter.controller';
import { LimiterService } from './limiter.service';

@Module({
  controllers: [LimiterController],
  providers: [LimiterService],
})
export class LimiterModule {}
