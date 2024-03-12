import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class TriviaRepository {
  constructor(private prisma: PrismaService) {}

  public async getTriviaMatchByStudentIdAndProgramId(studentId: string, programId: string) {
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
              programVersion: {
                programId,
              },
            },
          },
        },
      },
    });
  }

  public async findTriviaMatchByProgramId(programId: string) {
    const matches = await this.prisma.triviaMatch.findMany({
      where: {
        trivia: {
          programVersions: {
            some: {
              programVersion: {
                programId,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        studentTriviaMatches: true,
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
}
