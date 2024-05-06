import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../../../prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentModule } from '../student/student.module';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { ProgramRepository } from './program.repository';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
import { HttpException } from '@nestjs/common';
import { ApiRequest } from '../../../types/api-request.interface';
import { PillModule } from '../pill/pill.module';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';
import { AuthModule } from '../../auth/auth.module';
import { TriviaModule } from '../trivia/trivia.module';
import { AchievementModule } from '../achievement/achievement.module';
import { NotificationModule } from '../notification/notification.module';

process.env.JWT_SECRET = 'test_secret_long';
describe('Program Controller', () => {
  let programController: ProgramController;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        StudentModule,
        SpringPillModule,
        PillModule,
        QuestionnaireModule,
        AuthModule,
        AchievementModule,
        TriviaModule,
        NotificationModule,
      ],
      controllers: [ProgramController],
      providers: [ProgramService, ProgramRepository, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    programController = app.get(ProgramController);
    prismaService = app.get(PrismaService);
  });

  describe('Program controller', () => {
    describe('getProgramById', () => {
      it('Should return 404 when program does not exist', async () => {
        prismaService.program.findFirst.mockResolvedValueOnce(null);
        const req: ApiRequest = {
          user: {
            id: '1',
            authId: '',
          },
        } as any;

        await expect(programController.getProgramById(req, '123')).rejects.toThrow(new HttpException('Program not found', 404));
      });
    });
  });
});
