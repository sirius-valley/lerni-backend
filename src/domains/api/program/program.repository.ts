import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class ProgramRepository {
  constructor(private prisma: PrismaService) {}

  async getStudentProgramByStudentIdAndProgramIdWithSubmissions(studentId: string, programId: string) {
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
            programVersionQuestionnaireVersions: {
              orderBy: {
                order: 'asc',
              },
              include: {
                questionnaireVersion: {
                  include: {
                    questionnaire: true,
                    questionnaireSubmissions: {
                      where: {
                        studentId,
                      },
                      orderBy: [
                        {
                          createdAt: 'desc',
                        },
                      ],
                      take: 1,
                    },
                  },
                },
              },
            },
            programVersionPillVersions: {
              orderBy: {
                order: 'asc',
              },
              include: {
                pillVersion: {
                  include: {
                    pill: true,
                    pillSubmissions: {
                      where: {
                        studentId,
                      },
                      orderBy: {
                        createdAt: 'desc',
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
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

  async getLastProgramVersionWithSubmissions(studentId: string, programId: string) {
    return this.prisma.programVersion.findFirst({
      where: {
        programId,
      },
      include: {
        programVersionQuestionnaireVersions: {
          orderBy: {
            order: 'asc',
          },
          include: {
            questionnaireVersion: {
              include: {
                questionnaire: true,
                questionnaireSubmissions: {
                  include: {
                    questionnaireAnswers: {
                      select: {
                        id: true,
                      },
                    },
                  },
                  where: {
                    studentId,
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
        },
        programVersionPillVersions: {
          orderBy: {
            order: 'asc',
          },
          include: {
            pillVersion: {
              include: {
                pill: true,
                pillSubmissions: {
                  where: {
                    studentId,
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
        },
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
}
