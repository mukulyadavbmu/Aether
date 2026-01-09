import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement workout generation logic
  // TODO: Implement meal logging
  // TODO: Implement food image analysis
}
