import { AchievementLevelProgressDto } from './achievement-level-progress.dto';

export class AchievementDto {
  id: string;
  name: string;
  levels: AchievementLevelProgressDto[];

  constructor(data: AchievementDto) {
    this.id = data.id;
    this.name = data.name;
    this.levels = data.levels;
  }
}
