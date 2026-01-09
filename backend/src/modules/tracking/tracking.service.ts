import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement GPS tracking
  // TODO: Implement pacing coach logic
  // TODO: Implement route storage
}
