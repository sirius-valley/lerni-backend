import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class ProgramRepository {
  constructor(private prisma: PrismaService) {}

  async getStudentProgramByStudentIdAndProgramId(studentId: string, programId: string) {
    return this.prisma.studentProgram.findFirst({
      where: {
        studentId,
        programVersion: {
          programId,
        },
      },
      include: {
        programVersion: {
          include: {
            objectives: true,
            program: true,
          },
        },
      },
    });
  }
}
