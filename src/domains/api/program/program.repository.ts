import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CursorPagination } from '../../../types/cursor-pagination.interface';

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
            program: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });
  }

  async getLastProgramVersion(programId: string) {
    return this.prisma.programVersion.findFirst({
      where: {
        programId,
      },
      include: {
        objectives: true,
        program: {
          include: {
            teacher: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProgramPublicComments(programId: string, options: CursorPagination) {
    return this.prisma.comment.findMany({
      where: {
        programId,
        privacy: 'public',
      },
      orderBy: {
        createdAt: 'desc',
      },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? options.limit : 10,
      include: {
        student: true,
      },
    });
  }
}
