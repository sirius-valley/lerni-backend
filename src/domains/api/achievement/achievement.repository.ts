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

  async getAllAchievementsByStudentId(studentId: string) {
    return this.prisma.achievement.findMany({
      include: {
        achievementLevels: {
          orderBy: {
            tier: 'asc',
          },
          include: {
            studentAchievementLevels: {
              where: {
                studentId,
              },
            },
          },
        },
      },
    });
  }

  async getStudentAchievementLevelsByStudentId(studentId: string) {
    return this.prisma.studentAchievementLevel.findMany({
      where: {
        studentId,
      },
      orderBy: [
        {
          completedAt: 'asc',
        },
        {
          progress: 'desc',
        },
      ],
      take: 5,
      include: {
        achievementLevel: true,
      },
    });
  }

  async getAchievementLevelsNotStartedByStudentId(studentId: string) {
    return this.prisma.achievementLevel.findMany({
      where: {
        studentAchievementLevels: {
          none: {
            studentId,
          },
        },
      },
      orderBy: {
        tier: 'asc',
      },
      take: 5,
    });
  }
}
