import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RegisterRequestDto } from './dtos/register-request.dto';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async createAuthAndStudent(data: RegisterRequestDto) {
    return this.prisma.auth.create({
      data: {
        ...data,
        user: {
          create: {},
        },
      },
    });
  }

  async findAuthByEmail(email: string) {
    return this.prisma.auth.findUnique({
      where: { email },
    });
  }
}
