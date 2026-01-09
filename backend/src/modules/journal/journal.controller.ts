import { Controller, Get, Post, Body, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JournalService } from './journal.service';

@ApiTags('journal')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('journal')
export class JournalController {
  constructor(private journalService: JournalService) {}

  @Post('daily-summary')
  @ApiOperation({ summary: 'Submit daily summary' })
  async submitDailySummary(@Body() data: any, @Req() req: any) {
    return this.journalService.storeDailySummary(req.user.userId, data);
  }

  @Get('rating/today')
  @ApiOperation({ summary: 'Get today rating' })
  async getTodayRating() {
    return { message: 'Rating - Coming soon' };
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get goals' })
  async getGoals() {
    return { message: 'Goals - Coming soon' };
  }

  @Post('goals/generate')
  @ApiOperation({ summary: 'Generate goals with AI' })
  async generateGoals(@Body() data: any) {
    return { message: 'Goal generation - Coming soon', data };
  }

  @Get('ratings')
  @ApiOperation({ summary: 'Get historical ratings' })
  async getRatings() {
    // Mock historical data
    return [];
  }

  @Get('weekly-review')
  @ApiOperation({ summary: 'Get AI weekly review' })
  async getWeeklyReview() {
    return {
      review: 'Great week! You completed 85% of your tasks and maintained a consistent journal habit. Keep up the excellent work on your fitness goals.',
    };
  }

  @Get('memory/search')
  @ApiOperation({ summary: 'Search memories using RAG' })
  async searchMemories(@Query('query') query: string, @Req() req: any) {
    return this.journalService.searchMemories(req.user.userId, query);
  }

  @Get('memory/insight')
  @ApiOperation({ summary: 'Get contextual insight using RAG' })
  async getInsight(@Query('query') query: string, @Req() req: any) {
    return this.journalService.getContextualInsight(req.user.userId, query);
  }

  @Get('memory/patterns')
  @ApiOperation({ summary: 'Analyze patterns over time' })
  async analyzePatterns(
    @Query('type') type: string,
    @Query('days') days: string,
    @Req() req: any,
  ) {
    return this.journalService.analyzePatterns(
      req.user.userId,
      type as any,
      parseInt(days) || 90,
    );
  }

}
