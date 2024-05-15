import { Injectable } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { LimitOffsetPagination } from '../../../types/limit-offset.pagination';
import { LeaderboardStudentDto } from './dto/leaderboard-student.dto';

@Injectable()
export class LeaderboardService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  public async getLeaderboard(options: LimitOffsetPagination): Promise<LeaderboardStudentDto[]> {
    const leaderboard = await this.leaderboardRepository.getPaginatedLeaderboard(options);
    return leaderboard.map((student) => {
      return {
        id: student.id,
        profileImage: student.image,
        rank: Number(student.ranking),
        fullName: student.name + ' ' + student.lastname,
        email: student.email,
        points: student.pointCount,
      };
    });
  }

  public async getStudentRankingById(studentId: string) {
    const query = await this.leaderboardRepository.getStudentRankingById(studentId);
    return query[0].ranking;
  }
}
