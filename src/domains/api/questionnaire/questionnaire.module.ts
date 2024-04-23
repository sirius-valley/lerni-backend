import { Module } from '@nestjs/common';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireRepository } from './questionnaire.repository';
import { PrismaService } from '../../../prisma.service';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
import { StudentModule } from '../student/student.module';
import { AchievementModule } from '../achievement/achievement.module';
import { ProgramRepository } from '../program/program.repository';

@Module({
  controllers: [QuestionnaireController],
  imports: [SpringPillModule, StudentModule, AchievementModule],
  providers: [PrismaService, QuestionnaireService, QuestionnaireRepository, ProgramRepository],
  exports: [QuestionnaireService, QuestionnaireRepository],
})
export class QuestionnaireModule {}
