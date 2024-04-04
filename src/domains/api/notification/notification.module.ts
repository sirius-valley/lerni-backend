import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { AuthModule } from '../../auth/auth.module';
import { StudentModule } from '../student/student.module';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';

@Module({
  controllers: [NotificationController],
  imports: [StudentModule, AuthModule],
  providers: [PrismaService, NotificationService, NotificationRepository],
  exports: [NotificationService],
})
export class NotificationModule {}
