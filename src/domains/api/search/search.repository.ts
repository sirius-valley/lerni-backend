import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CursorPagination } from '../../../types/cursor-pagination.interface';

@Injectable()
export class SearchRepository {
  constructor(private prisma: PrismaService) {}

  async searchByPrograms(search: string, options: CursorPagination) {
    const total = Number(
      await this.prisma.program.count({
        where: {
          name: { contains: search },
        },
      }),
    );

    const results = await this.prisma.program.findMany({
      where: {
        name: { contains: search },
      },
      skip: options.before ? 0 : undefined,
      take: options.limit ? options.limit : 10,
      include: {
        teacher: true,
      },
    });

    return { results, total };
  }

  async searchByPills(search: string, options: CursorPagination) {
    const total = await this.prisma.program.count({
      where: {
        name: search,
      },
    });

    const results = await this.prisma.program.findMany({
      where: {
        name: search,
      },
      skip: options.before ? 1 : undefined,
      take: options.limit ? options.limit : 10,
    });
    return { results, total };
  }

  async searchByProfessor(search: string, options: CursorPagination) {
    const total = await this.prisma.program.count({
      where: {
        teacher: {
          name: { contains: search },
        },
      },
    });

    const results = await this.prisma.program.findMany({
      where: {
        teacher: {
          name: { contains: search },
        },
      },
      skip: options.before ? 1 : undefined,
      take: options.limit ? options.limit : 10,
    });

    return { results, total };
  }

  async searchByAll(search: string, options: CursorPagination) {
    const total = await this.prisma.program.count({
      where: {
        OR: [{ name: { contains: search } }, { teacher: { name: { contains: search } } }],
      },
    });

    const results = await this.prisma.program.findMany({
      where: {
        OR: [{ name: { contains: search } }, { teacher: { name: { contains: search } } }],
      },
      skip: options.before ? 1 : undefined,
      take: options.limit ? options.limit : 10,
    });
    return { results, total };
  }
}
