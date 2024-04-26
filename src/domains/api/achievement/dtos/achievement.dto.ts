import { AchievementLevelProgressDto } from './achievement-level-progress.dto';

export class AchievementDto {
  id: string;
  name: string;
  description: string;
  levels: AchievementLevelProgressDto[];

  constructor(data: AchievementDto) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.levels = data.levels;
  }
}
