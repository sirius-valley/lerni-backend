import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private prisma: PrismaService) {}

  async searchToken(id: string) {
    return this.prisma.auth.findUnique({
      select: {
        tokenDevice: true,
      },
      where: {
        id,
      },
    });
  }

  async updateToken(id: string, token: string) {
    return this.prisma.auth.update({
      where: {
        id,
      },
      data: {
        tokenDevice: token,
      },
    });
  }
}
