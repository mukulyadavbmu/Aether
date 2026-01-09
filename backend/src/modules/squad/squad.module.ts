import { Module } from '@nestjs/common';
import { SquadController } from './squad.controller';
import { SquadService } from './squad.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [SquadController],
  providers: [SquadService],
  exports: [SquadService],
})
export class SquadModule {}
