import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CursorPagination } from '../../../types/cursor-pagination.interface';

@Injectable()
export class SearchRepository {
  constructor(private prisma: PrismaService) {}

  async searchByPrograms(search: string, studentId: string, options: CursorPagination) {
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

    const results = await this.prisma.program.findMany({
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
      skip: Number(options.before),
      take: options.limit ? options.limit : 10,
      include: {
        teacher: true,
      },
    });

    return { results, total };
  }

  async searchByPills(search: string, studentId: string, options: CursorPagination) {
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
      skip: Number(options.before),
      take: options.limit ? options.limit : 10,
    });
    return { results, total };
  }

  async searchByProfessor(search: string, options: CursorPagination) {
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
      skip: Number(options.before),
      take: options.limit ? options.limit : 10,
    });

    return { results, total };
  }

  async searchByAll(search: string, studentId: string, options: CursorPagination) {
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
      take: options.limit ? options.limit : 10,
      skip: Number(options.before),
    });

    const pills = await this.searchByPills(search, studentId, options);
    const total = totalPrograms + pills.total;
    return { programResults, pillResults: pills.results, total };
  }
}
