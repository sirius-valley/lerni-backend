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
    });
  }

  async findTeacherByEmail(email: string) {
    return this.prisma.teacher.findFirst({
      where: { email },
    });
  }
}
