import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';
import { PrismaService } from '../../../prisma.service';
import { AuthModule } from '../../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { AchievementController } from './achievement.controller';
import { StudentModule } from '../student/student.module';

@Module({
  controllers: [AchievementController],
  imports: [AuthModule, NotificationModule, StudentModule],
  providers: [PrismaService, AchievementService, AchievementRepository],
  exports: [AchievementService],
})
export class AchievementModule {}
