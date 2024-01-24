import { PrismaService } from '../../../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PillRepository {
  constructor(private prisma: PrismaService) {}

  public async getById(id: string, studentId: string) {
    return this.prisma.pillVersion.findFirst({
      where: {
        pillId: id,
      },
      include: {
        pill: true,
        pillSubmissions: {
          where: {
            studentId: studentId,
          },
          include: {
            pillAnswers: true,
          },
        },
      },
    });
  }

  public async getPillByPillIdAndStudentId(pillId: string, studentId: string) {
    return this.prisma.pillVersion.findFirst({
      where: {
        pillId: pillId,
        programVersions: {
          some: {
            programVersion: {
              studentPrograms: {
                some: {
                  studentId: studentId,
                },
              },
            },
          },
        },
      },
      include: {
        pill: true,
      },
    });
  }

  public async getTeacherByPillId(pillId: string) {
    return this.prisma.teacher.findFirst({
      where: {
        programs: {
          some: {
            versions: {
              some: {
                programVersionPillVersions: {
                  some: {
                    pillVersionId: pillId,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  public async getPillSubmissionByPillIdAndStudentId(pillId: string, studentId: string) {
    return this.prisma.pillSubmission.findFirst({
      where: {
        studentId: studentId,
        pillVersion: {
          pillId: pillId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        pillAnswers: true,
      },
    });
  }
}
