import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductivityService } from './productivity.service';

@ApiTags('productivity')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('productivity')
export class ProductivityController {
  constructor(private productivityService: ProductivityService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'Get all tasks' })
  async getTasks() {
    return { message: 'Tasks - Coming soon' };
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create task' })
  async createTask(@Body() data: any) {
    return { message: 'Task creation - Coming soon', data };
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task' })
  async updateTask(@Param('id') id: string, @Body() data: any) {
    return { message: 'Task update - Coming soon', id, data };
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete task' })
  async deleteTask(@Param('id') id: string) {
    return { message: 'Task deletion - Coming soon', id };
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Get scheduled activities' })
  async getSchedule(@Query('startTime') startTime: string, @Query('endTime') endTime: string) {
    return this.productivityService.getSchedule(startTime, endTime);
  }

  @Post('resolve-conflict')
  @ApiOperation({ summary: 'AI-powered conflict resolution' })
  async resolveConflict(@Body() data: any) {
    return this.productivityService.resolveConflict(data);
  }
}
