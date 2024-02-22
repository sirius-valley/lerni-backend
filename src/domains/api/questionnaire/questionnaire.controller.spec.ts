import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnaireController } from './questionnaire.controller';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
import { PillModule } from '../pill/pill.module';
import { StudentModule } from '../student/student.module';
import { PrismaService } from '../../../prisma.service';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireRepository } from './questionnaire.repository';

describe('QuestionnaireController', () => {
  let controller: QuestionnaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionnaireController],
      imports: [SpringPillModule, PillModule, StudentModule],
      providers: [PrismaService, QuestionnaireService, QuestionnaireRepository],
    }).compile();

    controller = module.get<QuestionnaireController>(QuestionnaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
