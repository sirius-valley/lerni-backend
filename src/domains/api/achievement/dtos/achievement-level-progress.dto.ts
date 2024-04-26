import { AchievementLevel, AchievementTier } from '@prisma/client';

export class AchievementLevelProgressDto {
  id: string;
  description: string;
  targetValue: number;
  progress: number;
  unlocked: boolean;
  completion: number;
  tier: AchievementTier;
  pointsAwarded: number;
  icon: string;

  constructor(data: AchievementLevel, progress: number, unlocked: boolean, completion: number) {
    this.id = data.id;
    this.description = data.description;
    this.targetValue = data.targetValue;
    this.progress = progress;
    this.unlocked = unlocked;
    this.completion = completion;
    this.tier = data.tier;
    this.pointsAwarded = data.pointsAwarded;
    this.icon = data.icon;
  }
}
