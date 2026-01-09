import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LimiterService } from './limiter.service';

@ApiTags('limiter')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('limiter')
export class LimiterController {
  constructor(private limiterService: LimiterService) {}

  @Get('usage')
  @ApiOperation({ summary: 'Get app usage stats' })
  async getUsageStats() {
    return { message: 'Usage stats - Coming soon' };
  }

  @Post('limits')
  @ApiOperation({ summary: 'Set app limits' })
  async setLimits(@Body() data: any) {
    return { message: 'Set limits - Coming soon', data };
  }
}
