import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ProductivityService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async getSchedule(startTime: string, endTime: string) {
    // For MVP, return mock data - in production, fetch from calendar/tasks
    return [];
  }

  async resolveConflict(data: {
    activity: {
      name: string;
      type: string;
      scheduledTime: string;
      duration: number;
    };
    currentLocation: string;
    currentTime: string;
  }) {
    const prompt = `You are an AI life coach helping with schedule conflicts.

**Context:**
- User has "${data.activity.name}" (${data.activity.type}) scheduled at ${new Date(data.activity.scheduledTime).toLocaleTimeString()}
- Current time: ${new Date(data.currentTime).toLocaleTimeString()}
- User is currently at: ${data.currentLocation}
- Activity duration: ${data.activity.duration} minutes

**Conflict:** User is not in the right location for their scheduled activity.

**Task:** Provide 4 specific, actionable suggestions to resolve this conflict. Consider:
1. Rescheduling to a realistic time
2. Modifying the activity (shorter duration, different format)
3. Alternative solutions (virtual meeting, home workout, etc.)
4. When appropriate, suggest canceling

Format as a JSON array of strings, each suggestion being one concise sentence.

Example: ["Push workout to 8:00 PM (2 hours later)", "Reduce to 20-minute high-intensity session at home", "Replace with virtual yoga class (no commute)", "Skip today and double up tomorrow"]`;

    const aiResponse = await this.aiService.generateContent(prompt);
    
    try {
      // Parse AI response as JSON
      const suggestions = JSON.parse(aiResponse);
      return { suggestions };
    } catch (error) {
      // Fallback if AI doesn't return valid JSON
      return {
        suggestions: [
          `Reschedule ${data.activity.name} to ${new Date(new Date(data.activity.scheduledTime).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString()}`,
          `Reduce duration from ${data.activity.duration} to ${Math.floor(data.activity.duration / 2)} minutes`,
          'Convert to virtual/remote format',
          'Cancel and reschedule for tomorrow',
        ],
      };
    }
  }

  // TODO: Implement task CRUD
  // TODO: Implement countdown blocks
  // TODO: Implement enforcement logic
}
