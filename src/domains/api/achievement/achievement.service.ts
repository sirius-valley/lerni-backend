import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { AchievementRepository } from './achievement.repository';

@Injectable()
export class AchievementService {
  constructor(
    private readonly achievementRepository: AchievementRepository,
    private readonly notificationService: NotificationService,
  ) {}

  public async updateProgress(student: any, trackedValue: string) {
    const achievements = await this.findAchievement(trackedValue);
    if (!achievements) throw new HttpException('achievement not found', HttpStatus.NOT_FOUND);
    for (const achievement of achievements) {
      const studentAchievement = await this.achievementRepository.getStudentAchievement(student.id, achievement.id);
      if (!studentAchievement) {
        await this.achievementRepository.createStudenAchievementLevel(student.id, achievement.id, 1);
      } else {
        if (this.calculateProgress(achievement, studentAchievement.progress + 1) < 100) {
          await this.achievementRepository.updateProgress(studentAchievement.id, studentAchievement.progress + 1);
        } else if (studentAchievement.completedAt !== null) {
          await this.achievementRepository.updateCompletedDate(studentAchievement.id, studentAchievement.progress + 1);
          this.notificationService.sendNotification({
            userId: student.id,
            title: 'Conseguiste un logro',
            message: `Bieeen! Conseguiste el logro ${achievement.achievement.name}! Entra para saber mas`,
          });
        }
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
