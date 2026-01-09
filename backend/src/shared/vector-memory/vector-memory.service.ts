import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AiService } from '../../modules/ai/ai.service';

interface MemoryEntry {
  id: string;
  userId: string;
  content: string;
  embedding: number[];
  metadata: {
    type: 'journal' | 'goal' | 'task' | 'workout' | 'habit';
    date: string;
    sentiment?: string;
    tags?: string[];
  };
  timestamp: Date;
}

export interface SearchResult {
  entry: MemoryEntry;
  similarity: number;
}

@Injectable()
export class VectorMemoryService {
  private memoryDir = path.join(process.cwd(), 'data', 'vector-memory');
  private embeddingCache = new Map<string, number[]>();

  constructor(private aiService: AiService) {
    this.ensureMemoryDir();
  }

  private async ensureMemoryDir() {
    try {
      await fs.mkdir(this.memoryDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create memory directory:', error);
    }
  }

  /**
   * Store a new memory with vector embedding
   */
  async storeMemory(
    userId: string,
    content: string,
    metadata: MemoryEntry['metadata'],
  ): Promise<MemoryEntry> {
    const embedding = await this.generateEmbedding(content);

    const entry: MemoryEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      content,
      embedding,
      metadata,
      timestamp: new Date(),
    };

    await this.saveEntry(entry);
    return entry;
  }

  /**
   * Search memories using semantic similarity
   */
  async searchMemories(
    userId: string,
    query: string,
    limit: number = 5,
    filters?: Partial<MemoryEntry['metadata']>,
  ): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const allMemories = await this.getUserMemories(userId);

    // Filter by metadata if provided
    let filteredMemories = allMemories;
    if (filters) {
      filteredMemories = allMemories.filter((memory) => {
        if (filters.type && memory.metadata.type !== filters.type) return false;
        if (filters.date && memory.metadata.date !== filters.date) return false;
        return true;
      });
    }

    // Calculate cosine similarity for each memory
    const results: SearchResult[] = filteredMemories.map((entry) => ({
      entry,
      similarity: this.cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    // Sort by similarity and return top results
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }

  /**
   * Get contextual insights using RAG
   */
  async getContextualInsight(userId: string, query: string): Promise<string> {
    // Search relevant memories
    const relevantMemories = await this.searchMemories(userId, query, 10);

    if (relevantMemories.length === 0) {
      return "I don't have enough historical data about you yet. Keep using Aether to build your memory!";
    }

    // Build context from memories
    const context = relevantMemories
      .map(
        (result, index) =>
          `[${index + 1}] ${result.entry.metadata.date} (${result.entry.metadata.type}): ${result.entry.content}`,
      )
      .join('\n\n');

    // Use AI to generate insight
    const prompt = `You are an AI life coach with long-term memory about the user. Based on their historical data, provide a personalized insight.

**Historical Context:**
${context}

**Current Question:** ${query}

**Task:** Analyze the historical patterns and provide a specific, actionable insight. Reference specific past entries when relevant.

Example: "Based on your journal from 3 months ago, you mentioned struggling with goals on rainy Tuesdays. I notice it's Tuesday and raining today - consider breaking your goal into smaller 15-minute chunks like you successfully did on June 15th."`;

    return await this.aiService.generateContent(prompt);
  }

  /**
   * Analyze patterns across time
   */
  async analyzePatterns(
    userId: string,
    type: MemoryEntry['metadata']['type'],
    days: number = 90,
  ): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const memories = await this.getUserMemories(userId);
    const relevantMemories = memories.filter(
      (m) =>
        m.metadata.type === type &&
        new Date(m.metadata.date) >= cutoffDate,
    );

    // Use AI to analyze patterns
    const dataPoints = relevantMemories.map(
      (m) => `${m.metadata.date}: ${m.content}`,
    );

    const prompt = `Analyze the following ${type} data from the last ${days} days and identify patterns:

${dataPoints.join('\n')}

Provide:
1. **Key Patterns**: What trends do you notice?
2. **Success Factors**: What conditions correlate with better performance?
3. **Warning Signs**: What patterns precede struggles?
4. **Recommendations**: Specific actions based on these patterns

Format as JSON: {"patterns": [], "successFactors": [], "warnings": [], "recommendations": []}`;

    const analysis = await this.aiService.generateContent(prompt);

    try {
      return JSON.parse(analysis);
    } catch {
      return {
        patterns: ['Insufficient data for pattern analysis'],
        successFactors: [],
        warnings: [],
        recommendations: ['Continue logging to build pattern history'],
      };
    }
  }

  /**
   * Generate simple embeddings using text statistics
   * (In production, use a proper embedding model like @xenova/transformers)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }

    // Simple embedding: TF-IDF-like features (128 dimensions)
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const embedding = new Array(128).fill(0);

    // Character-level features
    for (let i = 0; i < Math.min(text.length, 64); i++) {
      embedding[i] = text.charCodeAt(i) / 255;
    }

    // Word count features
    embedding[64] = words.length / 100;
    embedding[65] = text.length / 1000;

    // Keyword features (simple sentiment/topic indicators)
    const keywords = {
      positive: ['good', 'great', 'excellent', 'happy', 'success'],
      negative: ['bad', 'fail', 'struggle', 'difficult', 'hard'],
      workout: ['gym', 'workout', 'exercise', 'run', 'train'],
      productivity: ['work', 'task', 'complete', 'finish', 'productive'],
    };

    Object.values(keywords).forEach((keywordList, catIndex) => {
      const matches = words.filter((w) => keywordList.includes(w)).length;
      embedding[66 + catIndex] = matches / words.length;
    });

    // Normalize
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0),
    );
    const normalized = embedding.map((val) => val / (magnitude || 1));

    this.embeddingCache.set(text, normalized);
    return normalized;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private async getUserMemories(userId: string): Promise<MemoryEntry[]> {
    const userFile = path.join(this.memoryDir, `${userId}.json`);

    try {
      const data = await fs.readFile(userFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet
      return [];
    }
  }

  private async saveEntry(entry: MemoryEntry) {
    const userFile = path.join(this.memoryDir, `${entry.userId}.json`);

    const existingMemories = await this.getUserMemories(entry.userId);
    existingMemories.push(entry);

    await fs.writeFile(userFile, JSON.stringify(existingMemories, null, 2));
  }
}
