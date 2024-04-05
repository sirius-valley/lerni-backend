import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AchievementRepository } from './achievement.repository';

@Injectable()
export class NotificationService {
  constructor(private readonly achievementRepository: AchievementRepository) {}

  public async updateProgress(student: any, trackedValue: string) {
    const achievements = await this.findAchievement(trackedValue);
    if (!achievements) throw new HttpException('achievement not found', HttpStatus.NOT_FOUND);
    for (const achievement of achievements) {
      //add method tu calculated value
      const progres = this.calculateProgress(achievement, 1);
      const studentAchievement = this.achievementRepository.getStudentAchievement(student.id, achievement.id);
      this.achievementRepository.updateProgress(studentAchievement[0].id, progres);
    }
  }

  private async findAchievement(trackedValue: string) {
    return await this.achievementRepository.getAchievementLevelByTrackedValue(trackedValue);
  }

  private calculateProgress(achievementLevel: any, value: number) {
    return (value * 100) / achievementLevel.targetValue;
  }
}
