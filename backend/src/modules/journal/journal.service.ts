import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { VectorMemoryService } from '@/shared/vector-memory/vector-memory.service';

@Injectable()
export class JournalService {
  constructor(
    private prisma: PrismaService,
    private vectorMemory: VectorMemoryService,
  ) {}

  async storeDailySummary(userId: string, data: { summary: string; rating?: number }) {
    // Store in vector memory for RAG
    await this.vectorMemory.storeMemory(userId, data.summary, {
      type: 'journal',
      date: new Date().toISOString().split('T')[0],
      sentiment: data.rating ? (data.rating >= 7 ? 'positive' : data.rating >= 4 ? 'neutral' : 'negative') : undefined,
    });

    return { message: 'Daily summary stored with vector embedding', data };
  }

  async searchMemories(userId: string, query: string) {
    return this.vectorMemory.searchMemories(userId, query);
  }

  async getContextualInsight(userId: string, query: string) {
    const insight = await this.vectorMemory.getContextualInsight(userId, query);
    return { insight };
  }

  async analyzePatterns(userId: string, type: 'journal' | 'goal' | 'task' | 'workout' | 'habit', days: number) {
    return this.vectorMemory.analyzePatterns(userId, type, days);
  }

  // TODO: Implement daily summary structuring with AI
  // TODO: Implement rating system
  // TODO: Implement goal generation
  // TODO: Implement weekly review
}
