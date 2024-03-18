import { Test, TestingModule } from '@nestjs/testing';
import { TriviaController } from './trivia.controller';
import { ProgramModule } from '../program/program.module';
import { TriviaService } from './trivia.service';
import { TriviaRepository } from './trivia.repository';
import { PrismaService } from '../../../prisma.service';
import { StudentModule } from '../student/student.module';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
process.env.JWT_SECRET = 'test_secret_long';
describe('TriviaController', () => {
  let controller: TriviaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TriviaController],
      imports: [ProgramModule, StudentModule, SpringPillModule],
      providers: [TriviaService, TriviaRepository, PrismaService],
    }).compile();

    controller = module.get<TriviaController>(TriviaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
