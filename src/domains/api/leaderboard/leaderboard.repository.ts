import { PrismaService } from '../../../prisma.service';
import { LimitOffsetPagination } from '../../../types/limit-offset.pagination';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LeaderboardRepository {
  constructor(private prismaService: PrismaService) {}

  async getPaginatedLeaderboard(options: LimitOffsetPagination): Promise<any[]> {
    const limit = options.limit ? options.limit : 10;
    const offset = options.offset ? options.offset : 0;

    return this.prismaService.$queryRaw`
        SELECT "Student".*,
               "Auth".email,
               ROW_NUMBER() OVER (ORDER BY "Student"."pointCount" DESC) AS ranking
        FROM "Student"
                 LEFT JOIN "Auth" ON "Student"."authId" = "Auth"."id"
        ORDER BY "Student"."pointCount" DESC
            LIMIT ${limit}
        OFFSET ${limit * offset}
    `;
  }

  async getStudentRankingById(studentId: string): Promise<any> {
    return this.prismaService.$queryRaw`
        SELECT COUNT(*) + 1 AS ranking
        FROM "Student"
        WHERE "pointCount" > (SELECT "pointCount"
                            FROM "Student"
                            WHERE id = ${studentId})
    `;
  }
}
