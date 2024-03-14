import { Injectable } from '@nestjs/common';
import { LimitOffsetPagination } from 'src/types/limit-offset.pagination';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class TriviaRepository {
  constructor(private prisma: PrismaService) {}

  public async getTriviaMatchByStudentIdAndProgramVersionId(studentId: string, programVersionId: string) {
    return this.prisma.triviaMatch.findFirst({
      where: {
        studentTriviaMatches: {
          some: {
            studentId,
          },
        },
        trivia: {
          programVersions: {
            some: {
              programVersionId,
            },
          },
        },
      },
    });
  }

  public async findTriviaMatchByProgramVersionId(programVersionId: string) {
    const matches = await this.prisma.triviaMatch.findMany({
      where: {
        trivia: {
          programVersions: {
            some: {
              programVersionId,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        studentTriviaMatches: {
          include: {
            student: true,
          },
        },
      },
    });
    return matches.find((match) => match.studentTriviaMatches.length === 1);
  }

  public async createStudentTriviaMatch(studentId: string, triviaMatchId: string) {
    return this.prisma.studentTriviaMatch.create({
      data: {
        studentId,
        triviaMatchId,
      },
    });
  }

  public async findTriviaByProgramVersionId(programVersionId: string) {
    return this.prisma.trivia.findFirst({
      where: {
        programVersions: {
          some: {
            programVersionId,
          },
        },
      },
    });
  }

  public async createTriviaMatch(studentId: string, triviaId: string) {
    return this.prisma.triviaMatch.create({
      data: {
        triviaId,
        studentTriviaMatches: {
          create: {
            studentId,
          },
        },
      },
    });
  }

  public async getStudentsByProgramVersionIdAndNoTriviaMatch(programVersionId: string, triviaId: string) {
    return this.prisma.student.findMany({
      where: {
        programs: {
          some: {
            programVersionId,
          },
        },
        studentTriviaMatches: {
          none: {
            triviaMatch: {
              triviaId,
            },
          },
        },
      },
    });
  }

  public async getStudentWithCompleteProgram(studentId: string, programVersionId: string) {
    return this.prisma.studentProgram.findFirst({
      where: {
        studentId,
        programVersion: {
          id: programVersionId,
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
  }

  public async getTriviaHistory(studentId: string, options: LimitOffsetPagination) {
    const results = await this.prisma.studentTriviaMatch.findMany({
      where: {
        studentId,
        triviaMatch: {
          isNot: {
            finishedDateTime: null,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: options.offset ? options.offset : 0,
      take: options.limit ? options.limit : 10,
    });
    const total = await this.prisma.studentTriviaMatch.count({
      where: {
        studentId,
      },
    });

    return { results, total };
  }

  public async getTriviaById(triviaId: string) {
    return await this.prisma.trivia.findUnique({
      where: {
        id: triviaId,
      },
    });
  }

  public async getTriviaMatchById(triviaMatchId: string) {
    return await this.prisma.triviaMatch.findUnique({
      where: {
        id: triviaMatchId,
      },
    });
  }

  public async getTriviaAnswerCorrectCountByMatchId(studentTriviaMatchId: string) {
    return await this.prisma.triviaAnswer.count({
      where: {
        studentTriviaMatchId,
        isCorrect: true,
      },
    });
  }

  public async getStudentTriviaMatchNotIdStudent(triviaMatchId: string, studentId: string, options: LimitOffsetPagination) {
    return await this.prisma.studentTriviaMatch.findFirst({
      where: {
        triviaMatchId,
        student: {
          isNot: {
            id: studentId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: options.offset ? options.offset : 0,
      take: options.limit ? options.limit : 10,
    });
  }

  public async getProgramTriviaVersionByTriviaId(triviaId: string) {
    return await this.prisma.programVersionTrivia.findFirst({
      where: {
        triviaId,
      },
    });
  }
}
