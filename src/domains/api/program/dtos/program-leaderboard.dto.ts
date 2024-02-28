import { LeaderboardItemDto } from './leaderboard-item.dto';

export class ProgramLeaderboardDto {
  up: LeaderboardItemDto[];
  down: LeaderboardItemDto[];

  constructor(up: LeaderboardItemDto[], down: LeaderboardItemDto[]) {
    this.up = up;
    this.down = down;
  }
}
