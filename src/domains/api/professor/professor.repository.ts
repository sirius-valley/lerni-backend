import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProfessorRequestDto } from './dto/professor-request.dto';

@Injectable()
export class ProfessorRepository {
  constructor(private prisma: PrismaService) {}

  async createSimpleProfessor(professor: ProfessorRequestDto) {
    return this.prisma.teacher.create({
      data: {
        ...professor,
      },
    });
  }

  async create(professor: ProfessorRequestDto) {
    return this.prisma.teacher.create({
      data: {
        ...professor,
      },
    });
  }
}
