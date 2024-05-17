import { Controller, Get, HttpCode, Query, Request } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { ApiRequest } from '../../../types/api-request.interface';

@Controller('api/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('')
  @HttpCode(200)
  async getLeaderboard(@Request() req: ApiRequest, @Query() query: any) {
    const { limit, offset } = query as Record<string, string>;
    return this.leaderboardService.getLeaderboard({ limit: Number(limit), offset: Number(offset) });
  }
}
