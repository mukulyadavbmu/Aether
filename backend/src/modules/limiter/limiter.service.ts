import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class LimiterService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement usage tracking
  // TODO: Implement limit enforcement
  // TODO: Implement grace period logic
}
