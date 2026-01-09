import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SquadService {
  private emailTransporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {
    // Configure email transporter (using Gmail SMTP for invitations)
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'aether.squads@gmail.com',
        pass: process.env.EMAIL_PASSWORD || '', // App password
      },
    });
  }

  // ============ SQUAD MANAGEMENT ============

  async createSquad(userId: string, data: { name: string; description?: string; weeklyGoalType?: string }) {
    // Generate AI weekly goal
    const weeklyGoal = await this.generateWeeklyGoal(data.weeklyGoalType || 'fitness');

    const squad = await this.prisma.squad.create({
      data: {
        name: data.name,
        description: data.description,
        creatorId: userId,
        weeklyGoal: weeklyGoal.description,
        weeklyGoalTarget: weeklyGoal.target,
        weekStartDate: this.getWeekStartDate(),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    // Add creator as first member
    await this.prisma.squadMember.create({
      data: {
        squadId: squad.id,
        userId: userId,
        role: 'creator',
      },
    });

    return squad;
  }

  async getSquad(squadId: string, userId: string) {
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            weeklyProgress: {
              where: {
                weekStartDate: this.getWeekStartDate(),
              },
            },
          },
        },
      },
    });

    if (!squad) {
      throw new NotFoundException('Squad not found');
    }

    // Check if user is a member
    const isMember = squad.members.some(m => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this squad');
    }

    return squad;
  }

  async getUserSquads(userId: string) {
    const memberships = await this.prisma.squadMember.findMany({
      where: { userId, isActive: true },
      include: {
        squad: {
          include: {
            creator: { select: { id: true, name: true } },
            members: {
              where: { isActive: true },
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    return memberships.map(m => m.squad);
  }

  async updateSquadGoal(squadId: string, userId: string) {
    // Verify user is creator/admin
    const member = await this.prisma.squadMember.findFirst({
      where: { squadId, userId, role: { in: ['creator', 'admin'] } },
    });

    if (!member) {
      throw new ForbiddenException('Only squad creators/admins can update goals');
    }

    // Generate new weekly goal
    const weeklyGoal = await this.generateWeeklyGoal('fitness');

    return this.prisma.squad.update({
      where: { id: squadId },
      data: {
        weeklyGoal: weeklyGoal.description,
        weeklyGoalTarget: weeklyGoal.target,
        weekStartDate: this.getWeekStartDate(),
      },
    });
  }

  // ============ LEADERBOARD & PROGRESS ============

  async getLeaderboard(squadId: string, userId: string) {
    // Verify membership
    await this.getSquad(squadId, userId);

    const weekStart = this.getWeekStartDate();

    const progress = await this.prisma.squadProgress.findMany({
      where: {
        squadId,
        weekStartDate: weekStart,
      },
      include: {
        member: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: {
        progressPercent: 'desc',
      },
    });

    return progress.map((p, index) => ({
      rank: index + 1,
      userId: p.member.userId,
      userName: p.member.user.name,
      progress: p.currentProgress,
      target: p.targetProgress,
      percentage: p.progressPercent,
      cameraAlarmDone: p.cameraAlarmCompleted,
      streak: p.streakDays,
      lastActive: p.lastActivityAt,
    }));
  }

  async updateProgress(squadId: string, userId: string, progress: number) {
    const weekStart = this.getWeekStartDate();

    // Get or create squad member
    let member = await this.prisma.squadMember.findFirst({
      where: { squadId, userId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this squad');
    }

    // Get squad goal
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
    });

    const target = (squad.weeklyGoalTarget as any)?.distance || 30; // Default 30km

    // Update or create progress
    const squadProgress = await this.prisma.squadProgress.upsert({
      where: {
        squadId_memberId_weekStartDate: {
          squadId,
          memberId: member.id,
          weekStartDate: weekStart,
        },
      },
      create: {
        squadId,
        memberId: member.id,
        weekStartDate: weekStart,
        currentProgress: progress,
        targetProgress: target,
        progressPercent: (progress / target) * 100,
        lastActivityAt: new Date(),
      },
      update: {
        currentProgress: progress,
        progressPercent: (progress / target) * 100,
        lastActivityAt: new Date(),
      },
    });

    // Check if lagging members need nudging
    await this.checkAndNudgeLaggingMembers(squadId);

    return squadProgress;
  }

  async markCameraAlarmCompleted(squadId: string, userId: string) {
    const weekStart = this.getWeekStartDate();

    const member = await this.prisma.squadMember.findFirst({
      where: { squadId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Not a squad member');
    }

    return this.prisma.squadProgress.upsert({
      where: {
        squadId_memberId_weekStartDate: {
          squadId,
          memberId: member.id,
          weekStartDate: weekStart,
        },
      },
      create: {
        squadId,
        memberId: member.id,
        weekStartDate: weekStart,
        cameraAlarmCompleted: true,
        currentProgress: 0,
        targetProgress: 30,
        progressPercent: 0,
      },
      update: {
        cameraAlarmCompleted: true,
      },
    });
  }

  // ============ INVITATION SYSTEM ============

  async inviteMember(squadId: string, inviterId: string, receiverEmail: string) {
    // Check if squad exists and user is member
    const squad = await this.getSquad(squadId, inviterId);

    // Check if already invited or member
    const existingUser = await this.prisma.user.findUnique({
      where: { email: receiverEmail },
    });

    if (existingUser) {
      const existingMember = await this.prisma.squadMember.findFirst({
        where: { squadId, userId: existingUser.id },
      });

      if (existingMember) {
        throw new BadRequestException('User is already a squad member');
      }
    }

    // Create invitation
    const invite = await this.prisma.squadInvite.create({
      data: {
        squadId,
        inviterId,
        receiverEmail,
        receiverId: existingUser?.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send email invitation
    await this.sendInvitationEmail(invite.id, receiverEmail, squad.name, invite.referralToken);

    return invite;
  }

  async acceptInvite(referralToken: string, userId: string) {
    const invite = await this.prisma.squadInvite.findUnique({
      where: { referralToken },
      include: { squad: true },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException('Invitation already processed');
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException('Invitation expired');
    }

    // Add user to squad
    await this.prisma.squadMember.create({
      data: {
        squadId: invite.squadId,
        userId,
        role: 'member',
      },
    });

    // Update invitation status
    await this.prisma.squadInvite.update({
      where: { id: invite.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
        receiverId: userId,
      },
    });

    return invite.squad;
  }

  private async sendInvitationEmail(inviteId: string, email: string, squadName: string, referralToken: string) {
    const downloadLink = `${process.env.APP_URL || 'https://aether-app.com'}/download?ref=${referralToken}`;
    const acceptLink = `${process.env.APP_URL || 'https://aether-app.com'}/squads/accept?token=${referralToken}`;

    const mailOptions = {
      from: '"Aether Squads" <aether.squads@gmail.com>',
      to: email,
      subject: `You've been invited to join "${squadName}" on Aether!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00F2FF;">🚀 Squad Invitation</h1>
          <p>You've been invited to join <strong>${squadName}</strong> on Aether - the AI-powered productivity & fitness platform!</p>
          
          <h2>What is Aether Squads?</h2>
          <ul>
            <li>📊 <strong>Shared Weekly Goals</strong> - Achieve targets together</li>
            <li>🏆 <strong>Live Leaderboard</strong> - Track everyone's progress</li>
            <li>💪 <strong>Peer Nudging</strong> - Encourage your squad mates</li>
            <li>⏰ <strong>Camera Alarms</strong> - Stay accountable with photo verification</li>
          </ul>
          
          <div style="margin: 30px 0;">
            <a href="${acceptLink}" style="background: linear-gradient(135deg, #00F2FF, #00FF41); color: #121212; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666;">Don't have the app yet?</p>
          <p><a href="${downloadLink}" style="color: #00F2FF;">Download Aether APK</a></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #333;">
          <p style="color: #888; font-size: 12px;">This invitation expires in 7 days. Your referral code: <code>${referralToken}</code></p>
        </div>
      `,
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Don't throw - invitation is still created
    }
  }

  // ============ NUDGING SYSTEM ============

  async sendNudge(senderId: string, receiverId: string, message: string, type: string = 'encourage') {
    // Verify both users are in same squad
    const commonSquad = await this.prisma.squadMember.findFirst({
      where: {
        userId: senderId,
        squad: {
          members: {
            some: { userId: receiverId },
          },
        },
      },
    });

    if (!commonSquad) {
      throw new BadRequestException('You can only nudge squad members');
    }

    return this.prisma.nudge.create({
      data: {
        senderId,
        receiverId,
        message,
        type,
      },
    });
  }

  async getNudges(userId: string, unreadOnly: boolean = false) {
    return this.prisma.nudge.findMany({
      where: {
        receiverId: userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markNudgeRead(nudgeId: string, userId: string) {
    const nudge = await this.prisma.nudge.findUnique({
      where: { id: nudgeId },
    });

    if (!nudge || nudge.receiverId !== userId) {
      throw new ForbiddenException('Cannot mark this nudge as read');
    }

    return this.prisma.nudge.update({
      where: { id: nudgeId },
      data: { isRead: true },
    });
  }

  private async checkAndNudgeLaggingMembers(squadId: string) {
    const weekStart = this.getWeekStartDate();

    // Get all members' progress
    const progress = await this.prisma.squadProgress.findMany({
      where: { squadId, weekStartDate: weekStart },
      include: { member: true },
      orderBy: { progressPercent: 'asc' },
    });

    if (progress.length < 2) return; // Need at least 2 members

    // Find lagging members (bottom 30% and below 50% completion)
    const laggingThreshold = 50;
    const lagging = progress.filter(p => p.progressPercent < laggingThreshold);

    for (const lagMember of lagging) {
      // Get top performers to send nudges
      const topPerformers = progress.filter(p => p.progressPercent > 70).slice(0, 2);

      for (const topMember of topPerformers) {
        // Auto-generate encouraging nudge (limit to 1 per day)
        const existingNudgeToday = await this.prisma.nudge.findFirst({
          where: {
            senderId: topMember.member.userId,
            receiverId: lagMember.member.userId,
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        });

        if (!existingNudgeToday) {
          await this.prisma.nudge.create({
            data: {
              senderId: topMember.member.userId,
              receiverId: lagMember.member.userId,
              message: `Hey! The squad needs you! You're at ${lagMember.progressPercent.toFixed(0)}% - let's push to catch up! 💪`,
              type: 'encourage',
            },
          });
        }
      }
    }
  }

  // ============ AI WEEKLY GOAL GENERATION ============

  private async generateWeeklyGoal(type: string = 'fitness') {
    const prompt = `Generate a challenging but achievable weekly fitness goal for a group of friends (squad). 
    
Type: ${type}
    
Return JSON with:
{
  "description": "Clear goal description",
  "target": { "type": "run|walk|study|workout", "distance": number, "unit": "km|hours" }
}

Example: 
{
  "description": "All squad members must run a combined total of 30km this week",
  "target": { "type": "run", "distance": 30, "unit": "km" }
}`;

    try {
      const response = await this.aiService.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('AI goal generation failed:', error);
    }

    // Fallback default goal
    return {
      description: 'All squad members must run 30km this week',
      target: { type: 'run', distance: 30, unit: 'km' },
    };
  }

  private getWeekStartDate(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as week start
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }
}
