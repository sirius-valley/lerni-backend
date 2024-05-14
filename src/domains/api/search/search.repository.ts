import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LimitOffsetPagination } from '../../../types/limit-offset.pagination';

@Injectable()
export class SearchRepository {
  constructor(private prisma: PrismaService) {}

  async searchByPrograms(search: string, studentId: string, options: LimitOffsetPagination) {
    const limit = options.limit ? options.limit : 10;
    const offset = options.offset ? (options.offset - 1) * limit : 0;
    const total = Number(
      await this.prisma.program.count({
        where: {
          name: { contains: search, mode: 'insensitive' },
          versions: {
            some: {
              studentPrograms: {
                some: {
                  studentId,
                },
              },
            },
          },
        },
      }),
    );

    const results = await this.prisma.studentProgram.findMany({
      where: {
        studentId,
        programVersion: {
          program: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      },
      skip: offset,
      take: limit,
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

    return { results, total };
  }

  async searchByPills(search: string, studentId: string, options: LimitOffsetPagination) {
    const total = await this.prisma.pill.count({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    const results = await this.prisma.pill.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
        pillVersion: {
          some: {
            programVersions: {
              some: {
                programVersion: {
                  studentPrograms: {
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
      skip: options.offset ? options.offset : 0,
      take: options.limit ? options.limit : 10,
    });
    return { results, total };
  }

  async searchByProfessor(search: string, options: LimitOffsetPagination) {
    const total = await this.prisma.program.count({
      where: {
        teacher: {
          name: { contains: search, mode: 'insensitive' },
        },
      },
    });

    const results = await this.prisma.program.findMany({
      where: {
        teacher: {
          name: { contains: search, mode: 'insensitive' },
        },
      },
      skip: options.offset ? options.offset : 0,
      take: options.limit ? options.limit : 10,
    });

    return { results, total };
  }

  async searchByAll(search: string, studentId: string, options: LimitOffsetPagination) {
    const totalPrograms = await this.prisma.program.count({
      where: {
        OR: [{ name: { contains: search, mode: 'insensitive' } }, { teacher: { name: { contains: search, mode: 'insensitive' } } }],
        versions: {
          some: {
            studentPrograms: {
              some: {
                studentId,
              },
            },
          },
        },
      },
    });

    const programResults = await this.prisma.program.findMany({
      where: {
        OR: [{ name: { contains: search, mode: 'insensitive' } }, { teacher: { name: { contains: search, mode: 'insensitive' } } }],
        versions: {
          some: {
            studentPrograms: {
              some: {
                studentId,
              },
            },
          },
        },
      },
      skip: options.offset ? options.offset : 0,
      take: options.limit ? options.limit : 10,
    });

    const pills = await this.searchByPills(search, studentId, options);
    const total = totalPrograms + pills.total;
    return { programResults, pillResults: pills.results, total };
  }
}
