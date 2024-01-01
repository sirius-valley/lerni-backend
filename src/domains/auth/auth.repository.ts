import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RegisterRequestDTO } from './dtos/RegisterRequestDTO';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async createAuth(data: RegisterRequestDTO) {
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
