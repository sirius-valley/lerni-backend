import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnaireController } from './questionnaire.controller';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
import { PillModule } from '../pill/pill.module';
import { StudentModule } from '../student/student.module';
import { PrismaService } from '../../../prisma.service';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireRepository } from './questionnaire.repository';
import { AchievementModule } from '../achievement/achievement.module';
import { ProgramRepository } from '../program/program.repository';

process.env.JWT_SECRET = 'test_secret_long';
describe('QuestionnaireController', () => {
  let controller: QuestionnaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionnaireController],
      imports: [SpringPillModule, PillModule, StudentModule, AchievementModule],
      providers: [PrismaService, QuestionnaireService, QuestionnaireRepository, ProgramRepository],
    }).compile();

    controller = module.get<QuestionnaireController>(QuestionnaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
