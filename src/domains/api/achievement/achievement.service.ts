import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { AchievementRepository } from './achievement.repository';
import { AchievementLevelProgressDto } from './dtos/achievement-level-progress.dto';
import { AchievementDto } from './dtos/achievement.dto';

@Injectable()
export class AchievementService {
  constructor(
    private readonly achievementRepository: AchievementRepository,
    private readonly notificationService: NotificationService,
  ) {}

  public async updateProgress(studentId: string, trackedValue: string) {
    const achievements = await this.findAchievement(trackedValue);
    if (!achievements) throw new HttpException('achievement not found', HttpStatus.NOT_FOUND);
    for (const achievement of achievements) {
      const studentAchievement = await this.achievementRepository.getStudentAchievement(studentId, achievement.id);
      if (!studentAchievement) {
        const createdStudentAchievement = await this.achievementRepository.createStudenAchievementLevel(studentId, achievement.id, 0);
        await this.checkProgress(achievement, createdStudentAchievement, studentId);
      } else {
        await this.checkProgress(achievement, studentAchievement, studentId);
      }
    }
  }

  private async checkProgress(achievement: any, studentAchievement: any, studentId: string) {
    if (this.calculateProgress(achievement, studentAchievement.progress + 1) < 100) {
      await this.achievementRepository.updateProgress(studentAchievement.id, studentAchievement.progress + 1);
    } else {
      await this.achievementRepository.updateCompletedDate(studentAchievement.id, studentAchievement.progress + 1);
      this.notificationService.sendNotification({
        userId: studentId,
        title: 'Conseguiste un logro',
        message: `Bieeen! Conseguiste el logro ${achievement.achievement.name}! Entra para saber mas`,
      });
    }
  }

  public async getAchievementsByStudentId(studentId: string) {
    const achievements = await this.achievementRepository.getAllAchievementsByStudentId(studentId);
    return achievements.map((achievement) => {
      return new AchievementDto({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        levels: achievement.achievementLevels.map((level) => {
          const completion = level.studentAchievementLevels[0] ? level.studentAchievementLevels[0].progress : 0;
          const unlocked = completion >= level.targetValue;
          const progress = completion / level.targetValue;
          return new AchievementLevelProgressDto(level, progress, unlocked, completion);
        }),
      });
    });
  }

  public async getRecentAchievementsCompletedByStudentId(studentId: string) {
    const studentAchievements = await this.achievementRepository.getStudentAchievementLevelsByStudentId(studentId, { limit: 5, offset: 0 });
    const achievementProgress = studentAchievements.map((achievement) => {
      const targetValue = achievement.achievementLevel.targetValue;
      const unlocked = achievement.progress >= targetValue;
      const progress = achievement.progress / targetValue;
      return new AchievementLevelProgressDto(achievement.achievementLevel, progress, unlocked, achievement.progress);
    });
    if (studentAchievements.length >= 5) return achievementProgress;
    const achievementsNotStarted = await this.achievementRepository.getAchievementLevelsNotStartedByStudentId(studentId, {
      limit: 5,
      offset: 0,
    });
    achievementsNotStarted.map((level) => achievementProgress.push(new AchievementLevelProgressDto(level, 0, false, 0)));
    return achievementProgress.slice(0, 5);
  }

  private async findAchievement(trackedValue: string) {
    return await this.achievementRepository.getAchievementLevelByTrackedValue(trackedValue);
  }

  private calculateProgress(achievementLevel: any, value: number) {
    return (value * 100) / achievementLevel.targetValue;
  }
}
