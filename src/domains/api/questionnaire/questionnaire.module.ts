import { Module } from '@nestjs/common';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireRepository } from './questionnaire.repository';
import { PrismaService } from '../../../prisma.service';
import { PillModule } from '../pill/pill.module';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
import { StudentModule } from '../student/student.module';

@Module({
  controllers: [QuestionnaireController],
  imports: [SpringPillModule, PillModule, StudentModule],
  providers: [PrismaService, QuestionnaireService, QuestionnaireRepository],
})
export class QuestionnaireModule {}