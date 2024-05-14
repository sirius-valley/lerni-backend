import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { ProgramRepository } from './program.repository';
import { StudentModule } from '../student/student.module';
import { PillModule } from '../pill/pill.module';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';
import { QuestionnaireRepository } from '../questionnaire/questionnaire.repository';
import { PillRepository } from '../pill/pill.repository';
import { AuthModule } from '../../auth/auth.module';
import { TriviaRepository } from '../trivia/trivia.repository';
import { AchievementModule } from '../achievement/achievement.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [ProgramController],
  imports: [StudentModule, PillModule, QuestionnaireModule, AuthModule, AchievementModule, NotificationModule],
  providers: [PrismaService, ProgramService, ProgramRepository, QuestionnaireRepository, PillRepository, TriviaRepository],
  exports: [ProgramService, ProgramRepository],
})
export class ProgramModule {}
