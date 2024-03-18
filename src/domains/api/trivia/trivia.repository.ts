import { Injectable } from '@nestjs/common';
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

  public async getStudentTriviaMatchByStudentIdAndTriviaId(studentId: string, triviaId: string) {
    return this.prisma.studentTriviaMatch.findFirst({
      where: {
        studentId,
        triviaMatch: {
          triviaId,
        },
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
}
