import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RegisterRequestDto } from './dtos/register-request.dto';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async createAuth(data: RegisterRequestDto) {
    return this.prisma.auth.create({
      data,
    });
  }

  async findAuthByEmail(email: string) {
    return this.prisma.auth.findUnique({
      where: { email },
    });
  }
}
