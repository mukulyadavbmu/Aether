import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

interface GoalHierarchy {
  main_goal: string;
  weekly_goals: Array<{ week: number; title: string; description: string }>;
  daily_tasks_week1: Array<{ day: number; tasks: string[] }>;
}

interface DailyRating {
  rating: number;
  feedback: string;
  achievements: string[];
  improvements: string[];
  question?: string;
}

interface StructuredDay {
  hourly_activities: Array<{ hour: number; activity: string }>;
  meals: Array<{ time: string; food: string; estimated_calories?: number }>;
  productivity_score: number;
  notable_events: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private gemini: GoogleGenerativeAI;
  private openai: OpenAI;
  private provider: 'gemini' | 'openai';

  constructor(private config: ConfigService) {
    this.provider = this.config.get('AI_PROVIDER') || 'gemini';

    // Initialize Gemini (Recommended)
    const geminiKey = this.config.get('GEMINI_API_KEY');
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
      this.logger.log('✅ Google Gemini AI initialized');
    }

    // Initialize OpenAI (Fallback)
    const openaiKey = this.config.get('OPENAI_API_KEY');
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.logger.log('✅ OpenAI initialized');
    }
  }

  /**
   * Structure daily summary into hourly table
   * Extracts activities, meals, and productivity from free-form text
   */
  async structureDailySummary(rawInput: string, dailyTasks?: string[]): Promise<StructuredDay> {
    const prompt = `You are the 'Aether' AI Data Interpreter. Your task is to analyze the user's daily summary and extract structured data.

User's Daily Summary:
"${rawInput}"

${dailyTasks ? `User's Planned Tasks:\n${dailyTasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}` : ''}

Extract and return ONLY valid JSON with this structure:
{
  "hourly_activities": [{"hour": 9, "activity": "Worked on project"}],
  "meals": [{"time": "12:30 PM", "food": "Chicken salad", "estimated_calories": 400}],
  "productivity_score": 7,
  "notable_events": ["Finished feature X", "Had productive meeting"]
}

Rules:
- productivity_score: 1-10 based on how much was accomplished
- hourly_activities: Extract main activities with approximate hours
- meals: Extract all food mentions
- notable_events: Key achievements or important happenings
- Return ONLY the JSON, no markdown, no explanations`;

    try {
      const response = await this.callLLM(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse structured response');
    } catch (error) {
      this.logger.error('Error structuring daily summary:', error);
      throw error;
    }
  }

  /**
   * Rate daily performance and provide feedback
   * Uses structured daily data and compares against goals
   */
  async rateDailyPerformance(
    structuredData: StructuredDay,
    dailyTasks: string[],
    userGoals?: any,
  ): Promise<DailyRating> {
    const prompt = `You are the 'Aether' AI Performance Reviewer. Analyze the user's day and provide a rating.

Today's Activities:
${JSON.stringify(structuredData.hourly_activities, null, 2)}

Planned Tasks:
${dailyTasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Notable Events:
${structuredData.notable_events.join(', ')}

Your Task:
1. Rate performance 1-10 based on goal adherence and productivity
2. List 2-3 achievements
3. List 1-2 areas for improvement
4. If rating < 5, ask ONE direct question about the biggest obstacle
5. Keep feedback motivational and constructive

Return ONLY valid JSON:
{
  "rating": 7,
  "feedback": "Strong day! You completed most planned tasks and stayed productive.",
  "achievements": ["Completed project milestone", "Maintained consistent work hours"],
  "improvements": ["Could improve time management in the morning"],
  "question": "What caused the delay in starting work today?"
}`;

    try {
      const response = await this.callLLM(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse rating response');
    } catch (error) {
      this.logger.error('Error rating performance:', error);
      throw error;
    }
  }

  /**
   * Generate hierarchical goal structure
   * Breaks down main goal into weekly milestones and daily tasks
   */
  async generateGoals(mainGoal: string, deadline: string, context?: any): Promise<GoalHierarchy> {
    const prompt = `You are the 'Aether' AI Goal Coach. Break down the user's main objective into actionable steps.

Main Goal: "${mainGoal}"
Deadline: ${deadline}
${context?.available_hours_per_day ? `Available Hours/Day: ${context.available_hours_per_day}` : ''}
${context?.experience_level ? `Experience Level: ${context.experience_level}` : ''}

Your Task:
1. Create 4-6 Weekly Goals (milestones) that lead to the main goal
2. Break down Week 1 into 7 Daily Tasks (specific, actionable)
3. Each task should be achievable in the available time
4. Make tasks SMART (Specific, Measurable, Achievable, Relevant, Time-bound)

Return ONLY valid JSON:
{
  "main_goal": "${mainGoal}",
  "weekly_goals": [
    {"week": 1, "title": "Setup & Planning", "description": "Complete initial setup and create detailed plan"}
  ],
  "daily_tasks_week1": [
    {"day": 1, "tasks": ["Research requirements", "Create project structure", "Setup dev environment"]}
  ]
}`;

    try {
      const response = await this.callLLM(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse goals response');
    } catch (error) {
      this.logger.error('Error generating goals:', error);
      throw error;
    }
  }

  /**
   * Generate proactive reminder for missed tasks
   */
  async generateProactiveReminder(missedTask: string, reason: string, daysInRow: number): Promise<string> {
    const prompt = `You are the 'Aether' AI Proactive Coach. Generate a short, motivational reminder.

Missed Task: "${missedTask}"
User's Reason: "${reason}"
Days Missed: ${daysInRow}

Generate ONE sentence (max 140 chars) that is:
- Direct and motivational
- Includes specific action
- Not dismissive or judgmental

Example: "Let's tackle [task] today! Start with just 15 minutes to build momentum."

Return ONLY the reminder text, no JSON, no quotes.`;

    try {
      const response = await this.callLLM(prompt);
      return response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      this.logger.error('Error generating reminder:', error);
      return `Time to catch up on "${missedTask}"! Small steps lead to big progress.`;
    }
  }

  /**
   * Analyze food image and estimate nutrition
   */
  async analyzeFoodImage(imageBase64: string): Promise<any> {
    if (this.provider === 'gemini' && this.gemini) {
      const model = this.gemini.getGenerativeModel({
        model: this.config.get('GEMINI_MODEL') || 'gemini-2.0-flash-exp',
      });

      const prompt = `Analyze this food image and provide nutritional information.

Identify:
1. All food items visible
2. Estimated portion sizes
3. Estimated calories, protein, carbs, fat per item

Return ONLY valid JSON:
{
  "items": [
    {"name": "Grilled chicken breast", "portion": "150g", "calories": 240, "protein": 45, "carbs": 0, "fat": 5}
  ],
  "total": {"calories": 240, "protein": 45, "carbs": 0, "fat": 5},
  "confidence": "medium"
}`;

      try {
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
        ]);
        const response = result.response.text();
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        this.logger.error('Error analyzing food image:', error);
      }
    }

    // Fallback response
    return {
      items: [],
      total: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      confidence: 'low',
      message: 'Please manually enter food details',
    };
  }

  /**
   * Generate comprehensive weekly review
   */
  async generateWeeklyReview(weekData: any): Promise<string> {
    const prompt = `You are the 'Aether' AI Weekly Reviewer. Create a comprehensive, motivational weekly review.

Week Data:
- Daily Ratings: ${weekData.daily_ratings?.join(', ') || 'N/A'}
- Goals Completed: ${weekData.goals_completed || 0}/${weekData.goals_planned || 0}
- Total Work Hours: ${weekData.total_work_hours || 0}
- Average Calories: ${weekData.avg_calories || 0}
- Activities: ${weekData.activities_count || 0} sessions

Generate a review with:
1. Overall Performance Summary (2-3 sentences)
2. Key Achievements (bullet points)
3. Areas for Improvement (1-2 items)
4. Actionable Recommendations for next week (2-3 items)
5. Motivational closing statement

Keep it personal, direct, and encouraging. Use second person ("You").`;

    try {
      const response = await this.callLLM(prompt);
      return response;
    } catch (error) {
      this.logger.error('Error generating weekly review:', error);
      return 'Weekly review generation temporarily unavailable. Please check back later.';
    }
  }

  /**
   * Core LLM call abstraction - handles both Gemini and OpenAI
   */
  private async callLLM(prompt: string): Promise<string> {
    if (this.provider === 'gemini' && this.gemini) {
      const model = this.gemini.getGenerativeModel({
        model: this.config.get('GEMINI_MODEL') || 'gemini-2.0-flash-exp',
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } else if (this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: this.config.get('OPENAI_MODEL') || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      return completion.choices[0].message.content || '';
    }

    throw new Error('No AI provider configured');
  }

  /**
   * Public method for general content generation
   */
  async generateContent(prompt: string): Promise<string> {
    return this.callLLM(prompt);
  }
}
