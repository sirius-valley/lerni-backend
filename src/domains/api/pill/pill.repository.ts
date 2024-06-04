import { PrismaService } from '../../../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PillRepository {
  constructor(private prisma: PrismaService) {}

  public async getPillVersionByPillIdAndStudentId(id: string, studentId: string) {
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

  public async createPillAnswer(pillSubmissionId: string, questionId: string, value: string | string[], progress: number) {
    value = JSON.stringify(value);
    return this.prisma.pillSubmission.update({
      data: {
        pillAnswers: {
          create: {
            questionId,
            value,
          },
        },
        progress,
      },
      where: {
        id: pillSubmissionId,
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

  public async getStudentProgramByStudentIdAndPillId(studentId: string, pillId: string) {
    return this.prisma.studentProgram.findFirst({
      where: {
        studentId: studentId,
        programVersion: {
          programVersionPillVersions: {
            some: {
              pillVersion: {
                pillId: pillId,
              },
            },
          },
        },
      },
    });
  }

  public async getProgramTeacherByPillId(pillId: string) {
    return this.prisma.teacher.findFirst({
      where: {
        programs: {
          some: {
            versions: {
              some: {
                programVersionPillVersions: {
                  some: {
                    pillVersion: {
                      pillId,
                    },
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        profession: true,
        image: true,
      },
    });
  }

  public async getPillTeacherByPillId(pillId: string) {
    return this.prisma.teacher.findFirst({
      where: {
        pills: {
          some: {
            id: pillId,
          },
        },
      },
    });
  }

  public async createPillSubmission(pillVersionId: string, studentId: string) {
    return this.prisma.pillSubmission.create({
      data: {
        studentId,
        pillVersionId,
      },
      include: {
        pillAnswers: true,
        pillVersion: {
          include: {
            pill: true,
            programVersions: true,
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
        pillVersion: {
          include: {
            pill: true,
            programVersions: true,
          },
        },
      },
    });
  }

  public async updatePillSubmissionProgress(pillSubmissionId: string, progress: number) {
    return this.prisma.pillSubmission.update({
      data: {
        progress,
      },
      where: {
        id: pillSubmissionId,
      },
    });
  }

  public async createPill(pill: { name: string; description: string; teacherComment: string; teacherId?: string }) {
    return this.prisma.pill.create({
      data: {
        ...pill,
      },
    });
  }

  public async createPillVersion(pillId: string, block: string, completionTimeMinutes: number) {
    return await this.prisma.pillVersion.create({
      data: {
        pillId,
        block,
        completionTimeMinutes,
        version: 1,
      },
    });
  }

  public async deletePill(pillId: string) {
    await this.prisma.programVersionPillVersion.deleteMany({
      where: {
        pillVersion: {
          pillId,
        },
      },
    });

    await this.prisma.pillVersion.deleteMany({
      where: {
        pillId,
      },
    });

    await this.prisma.pill.delete({
      where: {
        id: pillId,
      },
    });
  }
}
