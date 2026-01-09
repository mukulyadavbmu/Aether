import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TrackingService } from './tracking.service';

@ApiTags('tracking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Post('activity/start')
  @ApiOperation({ summary: 'Start activity tracking' })
  async startActivity(@Body() data: any) {
    return { message: 'Activity tracking - Coming soon', data };
  }

  @Post('activity/end')
  @ApiOperation({ summary: 'End activity tracking' })
  async endActivity(@Body() data: any) {
    return { message: 'Activity end - Coming soon', data };
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get activity history' })
  async getActivities() {
    return { message: 'Activity history - Coming soon' };
  }
}
