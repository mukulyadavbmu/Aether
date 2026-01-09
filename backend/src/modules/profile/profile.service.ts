import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return profile;
  }

  async updateProfile(
    userId: string,
    data: {
      age?: number;
      weight?: number;
      height?: number;
      dailyCalorieGoal?: number;
      fitnessGoal?: string;
    },
  ) {
    // Try to update existing profile or create new one
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      update: {
        age: data.age,
        weight: data.weight,
        height: data.height,
        dailyCalorieGoal: data.dailyCalorieGoal,
        fitnessGoal: data.fitnessGoal,
      },
      create: {
        userId,
        age: data.age,
        weight: data.weight,
        height: data.height,
        dailyCalorieGoal: data.dailyCalorieGoal,
        fitnessGoal: data.fitnessGoal,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return profile;
  }
}
