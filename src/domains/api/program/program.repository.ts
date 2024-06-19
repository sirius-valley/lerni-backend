import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CursorPagination } from '../../../types/cursor-pagination.interface';
import { CommentRequestDto } from './dtos/comment-request.dto';
import { LimitOffsetPagination } from '../../../types/limit-offset.pagination';

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

  async createProgramComment(studentId: string, commentRequest: CommentRequestDto) {
    return this.prisma.comment.create({
      data: {
        studentId,
        programId: commentRequest.programId,
        content: commentRequest.content ?? '',
        vote: commentRequest.vote,
        privacy: commentRequest.privacy,
      },
    });
  }

  async getStudentProgramByStudentIdAndProgramIdWithQuestionnaire(studentId: string, programId: string) {
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
              include: {
                questionnaireVersion: {
                  include: {
                    questionnaire: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getLeaderBoardByQuestionnaireId(questionnaireId: string, studentId: string) {
    return this.prisma.$queryRaw`
        WITH leaderboard AS (SELECT *,
                                    "PointRecord".id as "pointId",
                                    ROW_NUMBER()        OVER (ORDER BY amount DESC, "PointRecord"."createdAt" DESC) AS pos
                             FROM "PointRecord"
                                      JOIN "Student" ON "PointRecord"."studentId" = "Student"."id"
                             WHERE "sourceEntity" = 'questionnaire'
                               AND "entityId" = ${questionnaireId})
        SELECT *
        FROM (SELECT *
              FROM leaderboard
              WHERE pos <= 3
              UNION
              DISTINCT
              SELECT *
              FROM leaderboard
              WHERE pos - 1 <= (
                  SELECT pos FROM leaderboard WHERE "studentId" = ${studentId}
                  )
                AND pos + 1 >= (
                  SELECT pos FROM leaderboard WHERE "studentId" = ${studentId}
                  )
              ORDER BY pos) AS result;
    `;
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
        student: true,
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

  async getProgramsCompletedByStudentId(studentId: string, options: LimitOffsetPagination) {
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const data = await this.prisma.studentProgram.findMany({
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
          programVersionQuestionnaireVersions: {
            every: {
              questionnaireVersion: {
                questionnaireSubmissions: {
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
      take: limit,
      skip: limit * offset,
      include: {
        programVersion: {
          include: {
            program: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });

    const total = await this.prisma.studentProgram.count({
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
          programVersionQuestionnaireVersions: {
            every: {
              questionnaireVersion: {
                questionnaireSubmissions: {
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
    });

    return { data, total };
  }

  async getStudentProgramsInProgressByStudentId(studentId: string, options: LimitOffsetPagination) {
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const data = await this.prisma.studentProgram.findMany({
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
                programVersionQuestionnaireVersions: {
                  every: {
                    questionnaireVersion: {
                      questionnaireSubmissions: {
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
      take: limit,
      skip: limit * offset,
      include: {
        programVersion: {
          include: {
            program: {
              include: {
                teacher: true,
              },
            },
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
            programVersionQuestionnaireVersions: {
              include: {
                questionnaireVersion: {
                  include: {
                    questionnaireSubmissions: {
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

    const total = await this.prisma.studentProgram.count({
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
                programVersionQuestionnaireVersions: {
                  every: {
                    questionnaireVersion: {
                      questionnaireSubmissions: {
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
    });

    return { data, total };
  }

  async getProgramsNotStartedByStudentId(studentId: string, options: LimitOffsetPagination) {
    const limit = options.limit || 10;
    const offset = options.offset ? options.offset - 1 : 0;
    const data = await this.prisma.studentProgram.findMany({
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
      take: limit,
      skip: limit * offset,
      include: {
        programVersion: {
          include: {
            program: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });

    const total = await this.prisma.studentProgram.count({
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
    });

    return { data, total };
  }

  async getProgramPublicComments(programId: string, options: CursorPagination) {
    return this.prisma.comment.findMany({
      where: {
        programId,
        privacy: 'public',
        content: {
          not: '',
        },
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

  async getPageableLeaderBoardByQuestionnaireId(questionnaireId: string, options: LimitOffsetPagination) {
    const limit = options.limit || 10;
    const offset = options.offset || 0;

    const count = await this.prisma.pointRecord.count({
      where: {
        sourceEntity: 'questionnaire',
        entityId: questionnaireId,
      },
    });
    const leaderboard = await this.prisma.$queryRaw`
        SELECT *,
               "PointRecord".id as "pointId",
               ROW_NUMBER()        OVER (ORDER BY amount DESC, "PointRecord"."createdAt" DESC) AS pos
        FROM "PointRecord"
                 JOIN "Student" ON "PointRecord"."studentId" = "Student"."id"
        WHERE "sourceEntity" = 'questionnaire'
          AND "entityId" = ${questionnaireId}
        ORDER BY "amount" DESC, "PointRecord"."createdAt" DESC
            LIMIT ${limit}
        OFFSET ${offset * limit};
    `;
    return { leaderboard, count };
  }

  async getProgramByProgramVersion(programVersionId: string) {
    return this.prisma.program.findFirst({
      where: {
        versions: {
          some: {
            id: programVersionId,
          },
        },
      },
    });
  }

  async createProgram(name: string, description: string, hoursToComplete: number, pointsReward: number, teacherId: string, icon: string) {
    return this.prisma.program.create({
      data: {
        name,
        description,
        hoursToComplete,
        pointsReward,
        teacherId,
        icon,
      },
    });
  }

  async createProgramVersion(programId: string, version: number, startDate?: Date, endDate?: Date) {
    return await this.prisma.programVersion.create({
      data: {
        programId,
        version,
        startDate,
        endDate,
      },
    });
  }

  async createProgramPillVersion(programVersionId: string, pillVersionId: string, order: number) {
    return this.prisma.programVersionPillVersion.create({
      data: {
        programVersionId,
        pillVersionId,
        order,
      },
    });
  }

  async createProgramQuestionnaireVersion(programVersionId: string, questionnaireVersionId: string, order) {
    return await this.prisma.programVersionQuestionnaireVersion.create({
      data: {
        questionnaireVersionId,
        programVersionId,
        order,
      },
    });
  }

  async getProgramByProgramVersionId(id: string) {
    return this.prisma.programVersion.findUnique({
      where: {
        id,
      },
      include: {
        programVersionPillVersions: {
          include: {
            pillVersion: {
              include: {
                pill: true,
              },
            },
          },
        },
        programVersionQuestionnaireVersions: {
          include: {
            questionnaireVersion: {
              include: {
                questionnaire: true,
              },
            },
          },
        },
        programVersionTrivias: {
          include: {
            trivia: true,
          },
        },
        studentPrograms: {
          include: {
            student: {
              include: {
                auth: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
        program: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                lastname: true,
                email: true,
                profession: true,
                description: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }

  async countLikesByProgramId(programId: string) {
    return this.prisma.comment.count({
      where: {
        programId,
        vote: 'up',
      },
    });
  }

  async countDislikesByProgramId(programId: string) {
    return this.prisma.comment.count({
      where: {
        programId,
        vote: 'down',
      },
    });
  }

  async getStudentsByProgramVersionId(programVersionId: string) {
    return this.prisma.student.findMany({
      where: {
        programs: {
          some: {
            programVersionId,
          },
        },
      },
      include: {
        pillSubmissions: {
          where: {
            pillVersion: {
              programVersions: {
                some: {
                  programVersionId,
                },
              },
            },
          },
        },
        questionnaireSubmissions: {
          where: {
            questionnaireVersion: {
              programVersions: {
                some: {
                  programVersionId,
                },
              },
            },
          },
        },
      },
    });
  }

  async updateProgram(id: string, name: string, description: string, hoursToComplete: number, pointsReward: number, icon: string) {
    return await this.prisma.program.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        hoursToComplete,
        pointsReward,
        icon,
      },
    });
  }

  async downStudentProgram(email: string, programVersionId: string) {
    return await this.prisma.studentProgram.deleteMany({
      where: {
        student: {
          auth: {
            email,
          },
        },
        programVersionId,
      },
    });
  }

  async getProgramById(id: string) {
    return this.prisma.program.findUnique({
      where: {
        id,
      },
    });
  }

  async getProgramVersionList(options: LimitOffsetPagination) {
    const results = await this.prisma.programVersion.findMany({
      skip: options.offset ? options.offset : 0,
      take: options.limit ? options.limit : 10,
      include: {
        program: true,
      },
    });
    const total = await this.prisma.programVersion.count();

    return { results, total };
  }

  async getStudentsWithCompletedQuestionnaireByProgramVersionId(programVersionId: string) {
    return this.prisma.student.findMany({
      where: {
        programs: {
          some: {
            programVersionId,
          },
        },
        questionnaireSubmissions: {
          some: {
            progress: 100,
            questionnaireVersion: {
              programVersions: {
                some: {
                  programVersionId,
                },
              },
            },
          },
        },
      },
      include: {
        questionnaireSubmissions: {
          where: {
            questionnaireVersion: {
              programVersions: {
                some: {
                  programVersionId,
                },
              },
            },
          },
        },
      },
    });
  }

  async getStudentEnrroledByProgramVersionId(programVersionId: string) {
    return await this.prisma.student.findMany({
      where: {
        programs: {
          some: {
            programVersionId,
          },
        },
      },
    });
  }

  async getToStartProgram() {
    return this.prisma.programVersion.count({
      where: {
        startDate: {
          gte: new Date(),
        },
      },
    });
  }

  async getFinishedProgram() {
    return this.prisma.programVersion.count({
      where: {
        endDate: {
          lte: new Date(),
        },
      },
    });
  }

  async getTotalProgram() {
    return this.prisma.programVersion.count({});
  }

  async getInProgresProgram() {
    return this.prisma.programVersion.count({
      where: {
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
    });
  }

  async getStudentStatus(programVersionId: string) {
    return this.prisma.student.findMany({
      where: {
        programs: {
          some: {
            programVersionId,
          },
        },
      },
      include: {
        pillSubmissions: {
          where: {
            pillVersion: {
              programVersions: {
                some: {
                  programVersionId,
                },
              },
            },
          },
          include: {
            pillVersion: {
              include: {
                pill: true,
                programVersions: true,
              },
            },
          },
        },
        questionnaireSubmissions: {
          where: {
            questionnaireVersion: {
              programVersions: {
                some: {
                  programVersionId,
                },
              },
            },
          },
        },
      },
    });
  }

  async getPillsByProgramVersionId(programVersionId: string) {
    return this.prisma.pill.findMany({
      where: {
        pillVersion: {
          some: {
            programVersions: {
              some: {
                programVersionId,
              },
            },
          },
        },
      },
      include: {
        pillVersion: true,
      },
    });
  }

  async getquestionnarieByProgramVersionId(programVersionId: string) {
    return this.prisma.questionnaire.findMany({
      where: {
        questions: {
          some: {
            programVersions: {
              some: {
                programVersionId,
              },
            },
          },
        },
      },
      include: {
        questions: true,
      },
    });
  }

  async getStudentProgramByStudentIdAndProgramVersionIdWithProgress(studentId: string, programVersionId: string) {
    return this.prisma.studentProgram.findFirst({
      where: {
        studentId,
        programVersionId,
      },
      include: {
        student: true,
        programVersion: {
          include: {
            program: true,
            programVersionPillVersions: {
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
            programVersionQuestionnaireVersions: {
              include: {
                questionnaireVersion: {
                  include: {
                    questionnaire: true,
                    questionnaireSubmissions: {
                      where: {
                        studentId,
                      },
                      orderBy: {
                        createdAt: 'desc',
                      },
                      take: 1,
                      include: {
                        questionnaireAnswers: true,
                      },
                    },
                    _count: {
                      select: {
                        questionnaireSubmissions: {
                          where: {
                            studentId,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            programVersionTrivias: {
              include: {
                trivia: {
                  include: {
                    triviaMatches: {
                      where: {
                        studentTriviaMatches: {
                          some: {
                            studentId,
                          },
                        },
                      },
                      include: {
                        studentTriviaMatches: {
                          include: {
                            triviaAnswers: true,
                          },
                        },
                      },
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
}
