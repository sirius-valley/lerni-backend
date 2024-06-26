import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { PrismaService } from '../../../prisma.service';
import { StudentService } from './student.service';
import { StudentRepository } from './student.repository';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [LeaderboardModule],
  controllers: [StudentController],
  providers: [PrismaService, StudentService, StudentRepository, AttachStudentDataInterceptor],
  exports: [StudentService, StudentRepository],
})
export class StudentModule {}
