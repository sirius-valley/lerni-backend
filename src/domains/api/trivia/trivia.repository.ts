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
        NOT: {
          finishedDateTime: null,
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

  public async createStudentTriviaMatch(studentId: string, triviaMatchId: string, today: Date) {
    return this.prisma.studentTriviaMatch.create({
      data: {
        studentId,
        triviaMatchId,
        completeBefore: new Date(today.getTime() + 72 * 60 * 60 * 1000),
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

  public async getTriviaAnswersByTriviaMatchId(studentId: string, triviaMatchId: string) {
    return this.prisma.triviaAnswer.findMany({
      where: {
        studentTriviaMatch: {
          studentId,
          triviaMatchId,
        },
      },
      include: {
        studentTriviaMatch: {
          select: {
            triviaMatch: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  public async getOponentAnswer(studentId: string, triviaMatchId: string) {
    return this.prisma.triviaAnswer.findMany({
      select: {
        isCorrect: true,
        id: true,
      },
      where: {
        studentTriviaMatch: {
          triviaMatchId,
          student: {
            isNot: {
              id: studentId,
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
      include: {
        triviaMatch: true,
      },
    });
    const total = await this.prisma.studentTriviaMatch.count({
      where: {
        studentId,
        triviaMatch: {
          isNot: {
            finishedDateTime: null,
          },
        },
      },
    });

    return { results, total };
  }

  public async getTriviaById(triviaId: string) {
    return this.prisma.trivia.findUnique({
      where: {
        id: triviaId,
      },
    });
  }

  public async getTriviaMatchById(triviaMatchId: string) {
    return this.prisma.triviaMatch.findUnique({
      where: {
        id: triviaMatchId,
      },
      include: {
        trivia: {
          include: {
            programVersions: {
              include: {
                programVersion: {
                  include: {
                    program: true,
                  },
                },
              },
            },
          },
        },
        studentTriviaMatches: {
          include: {
            triviaAnswers: true,
            student: true,
          },
        },
      },
    });
  }

  public async getTriviaAnswerCorrectCountByMatchId(studentTriviaMatchId: string) {
    return this.prisma.triviaAnswer.count({
      where: {
        studentTriviaMatchId,
        isCorrect: true,
      },
    });
  }

  public async getStudentTriviaMatchNotIdStudent(triviaMatchId: string, studentId: string) {
    return this.prisma.studentTriviaMatch.findFirst({
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
      include: {
        student: true,
      },
    });
  }

  public async getProgramTriviaVersionByTriviaId(triviaId: string) {
    return this.prisma.programVersionTrivia.findFirst({
      where: {
        triviaId,
      },
    });
  }

  public async getNotFinishTrivia(studentId: string, options: LimitOffsetPagination) {
    return this.prisma.studentTriviaMatch.findMany({
      where: {
        studentId,
        triviaMatch: {
          finishedDateTime: null,
        },
      },
      skip: options.offset ? options.offset : 0,
      take: options.limit ? options.limit : 10,
      include: {
        triviaMatch: true,
        _count: {
          select: {
            triviaAnswers: true,
          },
        },
      },
    });
  }

  // public async getStudentTriviaMatchByStudentIdAndTriviaId(studentId: string, triviaId: string) {
  public async getStudentTriviaMatchByStudentIdAndTriviaMatchId(studentId: string, triviaMatchId: string) {
    return this.prisma.studentTriviaMatch.findFirst({
      where: {
        studentId,
        triviaMatchId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        triviaAnswers: true,
        triviaMatch: {
          include: {
            trivia: true,
          },
        },
      },
    });
  }

  public async createTriviaAnswer(studentTriviaMatchId: string, questionId: string, value: string | string[], isCorrect: boolean) {
    value = JSON.stringify(value);
    return this.prisma.studentTriviaMatch.update({
      data: {
        triviaAnswers: {
          create: {
            questionId,
            value,
            isCorrect,
          },
        },
      },
      where: {
        id: studentTriviaMatchId,
      },
      include: {
        triviaAnswers: true,
        triviaMatch: true,
      },
    });
  }

  public async getTriviaOpponent(studentId: string, triviaMatchId: string) {
    return this.prisma.studentTriviaMatch.findFirst({
      where: {
        studentId: {
          not: studentId,
        },
        triviaMatchId,
      },
      include: {
        student: true,
        triviaAnswers: true,
      },
    });
  }

  async setStudentTrivaMatchFinishedDateTime(id: string) {
    return this.prisma.studentTriviaMatch.update({
      data: {
        finishedDateTime: new Date(),
      },
      where: {
        id,
      },
    });
  }

  async setTriviaMatchFinishedDateTime(triviaMatchId: string) {
    return this.prisma.triviaMatch.update({
      data: {
        finishedDateTime: new Date(),
      },
      where: {
        id: triviaMatchId,
      },
    });
  }

  async getAllNotFinishTrivias() {
    return this.prisma.studentTriviaMatch.findMany({
      where: {
        finishedDateTime: null,
      },
    });
  }

  async updateFinishDate(studentTriviaMatchId: string, date: Date) {
    return this.prisma.studentTriviaMatch.update({
      where: {
        id: studentTriviaMatchId,
      },
      data: {
        finishedDateTime: date,
      },
    });
  }

  async resetTimer(triviaMatchId: string, newDate: Date) {
    return this.prisma.studentTriviaMatch.update({
      where: {
        id: triviaMatchId,
      },
      data: {
        completeBefore: newDate,
      },
    });
  }

  async getStudentMatchbyTriviaMachtId(triviaMatchId: string) {
    return this.prisma.triviaMatch.findMany({
      where: {
        id: triviaMatchId,
      },
      include: {
        studentTriviaMatches: true,
      },
    });
  }

  async updateFinishDateTriviaMatch(triviaId: string) {
    return this.prisma.triviaMatch.update({
      where: {
        id: triviaId,
      },
      data: {
        finishedDateTime: new Date(),
      },
    });
  }

  async getTriviaMatchByIdAndStudentId(triviaMatchId: string, studentId: string) {
    return this.prisma.triviaMatch.findFirst({
      where: {
        id: triviaMatchId,
        studentTriviaMatches: {
          some: {
            studentId,
          },
        },
      },
      include: {
        trivia: true,
        studentTriviaMatches: {
          include: {
            student: true,
            triviaAnswers: true,
          },
        },
      },
    });
  }

  async getCompletedProgramsWithNoTriviaMatchByStudentId(studentId: string) {
    return this.prisma.studentProgram.findMany({
      where: {
        studentId,
        programVersion: {
          programVersionTrivias: {
            none: {
              trivia: {
                triviaMatches: {
                  some: {
                    studentTriviaMatches: {
                      some: {
                        studentId,
                      },
                    },
                  },
                },
              },
            },
          },
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
