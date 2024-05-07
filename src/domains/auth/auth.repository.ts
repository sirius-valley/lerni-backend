import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { AdminRegisterRequestDto } from './dtos/admin-register-request.dto';

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

  async createTeacher(data: AdminRegisterRequestDto) {
    return this.prisma.teacher.create({
      data: {
        ...data,
        profession: 'teacher',
      },
    });
  }

  async findAuthByEmail(email: string) {
    return this.prisma.auth.findUnique({
      where: { email },
      include: {
        user: true,
      },
    });
  }

  async findTeacherByEmail(email: string) {
    return this.prisma.teacher.findFirst({
      where: { email },
    });
  }

  async createTemporalAuth(email: string) {
    return this.prisma.auth.create({
      data: {
        email,
        password: '$2b$10$8mYwGBbOvUJEx63DYIZc0.NQdFyW9x0jcctuKk/D7G0gmCuwaAnrO',
        tokenDevice: null,
        isActive: false,
        user: {
          create: {},
        },
      },
      include: {
        user: true,
      },
    });
  }

  async updateIsActive(data: RegisterRequestDto) {
    return this.prisma.auth.update({
      data: {
        ...data,
        isActive: true,
        user: {},
      },
      where: {
        email: data.email,
      },
    });
  }

  async getLastHourResetTokens(authId: string) {
    return this.prisma.resetPasswordToken.findMany({
      where: {
        authId,
        createdAt: {
          // one hour before
          gte: new Date(new Date().getTime() - 60 * 60 * 1000),
        },
      },
    });
  }

  async createResetPasswordToken(token: string, authId: string) {
    return this.prisma.resetPasswordToken.create({
      data: {
        authId,
        token,
      },
    });
  }

  async getLatestResetPasswordToken(authId: string) {
    return this.prisma.resetPasswordToken.findFirst({
      where: {
        authId,
        createdAt: {
          //one day before
          gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateResetPasswordTokenData(id: string, data: any) {
    return this.prisma.resetPasswordToken.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }
}
