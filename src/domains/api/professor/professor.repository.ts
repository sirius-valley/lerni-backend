import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LimitOffsetPagination } from 'src/types/limit-offset.pagination';
import { ProfessorRequestDto } from './dto/professor-request.dto';
import { SimpleProfessortDto } from './dto/simple-professor.dto';

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

  async getProfessors(options: LimitOffsetPagination): Promise<SimpleProfessortDto[]> {
    const teachers = this.prisma.teacher.findMany({
      skip: options.offset ? options.offset : 0,
      take: options.limit ? options.limit : 10,
    });
    return (await teachers).map((teacher) => new SimpleProfessortDto(teacher));
  }
}
