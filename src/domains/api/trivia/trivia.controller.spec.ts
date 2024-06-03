import { Test, TestingModule } from '@nestjs/testing';
import { TriviaController } from './trivia.controller';
import { ProgramModule } from '../program/program.module';
import { TriviaService } from './trivia.service';
import { TriviaRepository } from './trivia.repository';
import { PrismaService } from '../../../prisma.service';
import { StudentModule } from '../student/student.module';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
import { HeadlandsAdapter } from '../pill/adapters/headlands.adapter';
import { NotificationModule } from '../notification/notification.module';
import { AchievementModule } from '../achievement/achievement.module';

process.env.JWT_SECRET = 'test_secret_long';
process.env.NODE_ENV = 'development';
process.env.OPENAI_API_KEY = 'openai_token';
describe('TriviaController', () => {
  let controller: TriviaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TriviaController],
      imports: [ProgramModule, StudentModule, SpringPillModule, NotificationModule, AchievementModule, ProgramModule],
      providers: [TriviaService, TriviaRepository, PrismaService, HeadlandsAdapter],
    }).compile();

    controller = module.get<TriviaController>(TriviaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
