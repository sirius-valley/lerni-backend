import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
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

  async getProfessors(): Promise<SimpleProfessortDto[]> {
    const teachers = this.prisma.teacher.findMany();
    return (await teachers).map((teacher) => new SimpleProfessortDto(teacher));
  }
}
