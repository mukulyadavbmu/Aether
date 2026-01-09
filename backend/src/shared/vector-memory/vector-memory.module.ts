import { Module, Global } from '@nestjs/common';
import { VectorMemoryService } from './vector-memory.service';
import { AiModule } from '../../modules/ai/ai.module';

@Global()
@Module({
  imports: [AiModule],
  providers: [VectorMemoryService],
  exports: [VectorMemoryService],
})
export class VectorMemoryModule {}
