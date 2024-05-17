import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../../../prisma.service';
import { LeaderboardRepository } from './leaderboard.repository';

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService, PrismaService, LeaderboardRepository],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
