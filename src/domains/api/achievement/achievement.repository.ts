import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AchievementRepository {
  constructor(private prisma: PrismaService) {}

  async updateProgress(id: string, progress: number) {
    return this.prisma.studentAchievementLevel.update({
      where: {
        id,
      },
      data: {
        progress,
      },
    });
  }

  async updateCompletedDate(id: string, progress: number) {
    return this.prisma.studentAchievementLevel.update({
      where: {
        id,
      },
      data: {
        progress,
        completedAt: new Date(),
      },
    });
  }

  async getAchievementLevelByTrackedValue(trackedValue: string) {
    return this.prisma.achievementLevel.findMany({
      where: {
        achievement: {
          trackedValue,
        },
      },
      include: {
        achievement: true,
      },
    });
  }

  async getStudentAchievement(studentId: string, achievementLevelId: string) {
    return this.prisma.studentAchievementLevel.findFirst({
      where: {
        studentId,
        achievementLevelId,
      },
    });
  }

  async createStudenAchievementLevel(studentId: string, achievementLevelId: string, progress: number) {
    return this.prisma.studentAchievementLevel.create({
      data: {
        studentId,
        achievementLevelId,
        progress,
      },
    });
  }
}
