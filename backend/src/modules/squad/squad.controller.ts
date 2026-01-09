import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { SquadService } from './squad.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('squad')
@UseGuards(JwtAuthGuard)
export class SquadController {
  constructor(private readonly squadService: SquadService) {}

  // ============ SQUAD MANAGEMENT ============

  @Post()
  async createSquad(
    @Req() req,
    @Body() data: { name: string; description?: string; weeklyGoalType?: string },
  ) {
    return this.squadService.createSquad(req.user.id, data);
  }

  @Get()
  async getUserSquads(@Req() req) {
    return this.squadService.getUserSquads(req.user.id);
  }

  @Get(':id')
  async getSquad(@Param('id') squadId: string, @Req() req) {
    return this.squadService.getSquad(squadId, req.user.id);
  }

  @Put(':id/goal')
  async updateSquadGoal(@Param('id') squadId: string, @Req() req) {
    return this.squadService.updateSquadGoal(squadId, req.user.id);
  }

  // ============ LEADERBOARD & PROGRESS ============

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') squadId: string, @Req() req) {
    return this.squadService.getLeaderboard(squadId, req.user.id);
  }

  @Post(':id/progress')
  async updateProgress(
    @Param('id') squadId: string,
    @Req() req,
    @Body() data: { progress: number },
  ) {
    return this.squadService.updateProgress(squadId, req.user.id, data.progress);
  }

  @Post(':id/camera-alarm')
  async markCameraAlarmCompleted(@Param('id') squadId: string, @Req() req) {
    return this.squadService.markCameraAlarmCompleted(squadId, req.user.id);
  }

  // ============ INVITATION SYSTEM ============

  @Post(':id/invite')
  async inviteMember(
    @Param('id') squadId: string,
    @Req() req,
    @Body() data: { email: string },
  ) {
    return this.squadService.inviteMember(squadId, req.user.id, data.email);
  }

  @Post('accept-invite')
  async acceptInvite(@Req() req, @Body() data: { referralToken: string }) {
    return this.squadService.acceptInvite(data.referralToken, req.user.id);
  }

  // ============ NUDGING SYSTEM ============

  @Post('nudge')
  async sendNudge(
    @Req() req,
    @Body() data: { receiverId: string; message: string; type?: string },
  ) {
    return this.squadService.sendNudge(req.user.id, data.receiverId, data.message, data.type);
  }

  @Get('nudges/list')
  async getNudges(@Req() req, @Query('unreadOnly') unreadOnly?: string) {
    return this.squadService.getNudges(req.user.id, unreadOnly === 'true');
  }

  @Put('nudges/:id/read')
  async markNudgeRead(@Param('id') nudgeId: string, @Req() req) {
    return this.squadService.markNudgeRead(nudgeId, req.user.id);
  }
}
