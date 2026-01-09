import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@GetUser() user: any) {
    return this.profileService.getProfile(user.id);
  }

  @Post()
  async updateProfile(
    @GetUser() user: any,
    @Body() profileData: {
      age?: number;
      weight?: number;
      height?: number;
      dailyCalorieGoal?: number;
      fitnessGoal?: string;
    },
  ) {
    return this.profileService.updateProfile(user.id, profileData);
  }

  @Put()
  async updateProfilePut(
    @GetUser() user: any,
    @Body() profileData: {
      age?: number;
      weight?: number;
      height?: number;
      dailyCalorieGoal?: number;
      fitnessGoal?: string;
    },
  ) {
    return this.profileService.updateProfile(user.id, profileData);
  }
}
