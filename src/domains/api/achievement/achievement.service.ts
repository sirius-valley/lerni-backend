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
      const studentAchievement = await this.achievementRepository.getStudentAchievement(student.id, achievement.id);
      if (!studentAchievement) {
        //add value
        await this.achievementRepository.createStudenAchievementLevel(student.id, achievement.id, 1);
      } else {
        //TODO: add value
        await this.achievementRepository.updateProgress(studentAchievement.id, 1);
      }
    }
  }

  private async findAchievement(trackedValue: string) {
    return await this.achievementRepository.getAchievementLevelByTrackedValue(trackedValue);
  }

  private calculateProgress(achievementLevel: any, value: number) {
    return (value * 100) / achievementLevel.targetValue;
  }
}
