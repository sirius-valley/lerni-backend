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

  async getProgramsCompletedByStudentId(studentId: string) {
    return this.prisma.studentProgram.findMany({
      where: {
        studentId,
        programVersion: {
          programVersionPillVersions: {
            every: {
              pillVersion: {
                pillSubmissions: {
                  some: {
                    studentId,
                    progress: 100,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
      include: {
        programVersion: {
          include: {
            program: true,
          },
        },
      },
    });
  }

  async getStudentProgramsInProgressByStudentId(studentId: string) {
    return this.prisma.studentProgram.findMany({
      where: {
        studentId,
        AND: [
          {
            // if there are no submissions it is not in progress
            NOT: {
              programVersion: {
                programVersionPillVersions: {
                  none: {
                    pillVersion: {
                      pillSubmissions: {
                        some: {
                          studentId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            NOT: {
              // if all submissions are 100% it is not in progress
              programVersion: {
                programVersionPillVersions: {
                  every: {
                    pillVersion: {
                      pillSubmissions: {
                        some: {
                          studentId,
                          progress: 100,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 9,
      include: {
        programVersion: {
          include: {
            program: true,
            programVersionPillVersions: {
              include: {
                pillVersion: {
                  include: {
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
          },
        },
      },
    });
  }

  async getProgramsNotStartedByStudentId(studentId: string) {
    return this.prisma.studentProgram.findMany({
      where: {
        studentId,
        programVersion: {
          programVersionPillVersions: {
            none: {
              pillVersion: {
                pillSubmissions: {
                  some: {
                    studentId,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
      include: {
        programVersion: {
          include: {
            program: true,
          },
        },
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
