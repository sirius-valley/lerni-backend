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
}
