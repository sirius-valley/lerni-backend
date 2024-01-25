import { Test, TestingModule } from '@nestjs/testing';
import { PillController } from './pill.controller';
import { PillService } from './pill.service';
import { PillRepository } from './pill.repository';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { PrismaService } from '../../../prisma.service';
import { configuration } from '../../../../config/configuration';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { HttpException } from '@nestjs/common';
import { StudentModule } from '../student/student.module';
import { AnswerRequestDto } from './dtos/answer-request.dto';
import { PillProgressResponseDto } from './dtos/pill-progress-response.dto';

process.env.NODE_ENV = 'development';
describe('PillController', () => {
  let pillController: PillController;
  let prismaService: DeepMockProxy<PrismaService>;
  let springPillService: DeepMockProxy<SpringPillService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
          load: [configuration],
        }),
        StudentModule,
      ],
      controllers: [PillController],
      providers: [PillService, PillRepository, PrismaService, SpringPillService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .overrideProvider(SpringPillService)
      .useValue(mockDeep<SpringPillService>())
      .compile();

    pillController = app.get(PillController);
    prismaService = app.get(PrismaService);
    springPillService = app.get(SpringPillService);
  });

  const req = {
    user: {
      id: '1',
    },
    headers: {
      authorization: 'Bearer token',
    },
  };

  describe('Pill controller', () => {
    describe('getPillVersionByPillId', () => {
      it("should return 404 when pill doesn't exist", async () => {
        (prismaService.pillVersion as any).findFirst.mockResolvedValueOnce(null);

        await expect(pillController.getPillVersionByPillId(req as any, '123')).rejects.toThrow(new HttpException('Pill not found', 404));
      });

      it("should fail when pill-external-api doesn't respond", async () => {
        (prismaService.pillVersion as any).findFirst.mockResolvedValueOnce({
          id: '1',
          pillId: '123',
          version: 1,
        } as any);
        (springPillService as any).getSpringProgress.mockRejectedValueOnce(new HttpException('Error while calculating progress', 500));

        await expect(pillController.getPillVersionByPillId(req as any, '123')).rejects.toThrow(
          new HttpException('Error while calculating progress', 500),
        );
      });

      it('should return pill version when pill exists', async () => {
        (prismaService.pillVersion as any).findFirst.mockResolvedValueOnce({
          id: '1',
          pillId: '123',
          version: 1,
          pill: {
            id: '123',
            name: 'name',
            description: 'description',
            teacherComment: 'teacherComment',
          },
          completionTimeMinutes: 10,
        } as any);
        (prismaService.teacher as any).findFirst.mockResolvedValueOnce({
          id: '1',
          name: 'name',
          lastname: 'lastname',
          profession: 'profession',
          image: 'image',
        } as any);
        (springPillService as any).getSpringProgress.mockResolvedValueOnce({
          progress: 0.5,
          completed: false,
        } as any);

        await expect(pillController.getPillVersionByPillId(req as any, '123')).resolves.toMatchObject<PillProgressResponseDto>({
          pill: {
            version: 1,
            completionTimeMinutes: 10,
            data: {
              progress: 0.5,
              completed: false,
            },
            id: '123',
            name: 'name',
            description: 'description',
            teacherComment: 'teacherComment',
          },
          teacher: {
            id: '1',
            name: 'name',
            lastname: 'lastname',
            profession: 'profession',
            image: 'image',
          },
        });
      });
    });

    describe('answerPill', () => {
      it('should return pill version when pill exists', async () => {
        (prismaService.pillSubmission as any).findFirst.mockResolvedValueOnce({
          pillVersion: {
            id: '1',
            pillId: '123',
            version: 1,
            completionTimeMinutes: 10,
            pill: {
              id: '123',
              name: 'name',
              description: 'description',
              teacherComment: 'teacherComment',
            },
          },
          pillAnswers: [],
        } as any);
        (springPillService as any).answerPill.mockResolvedValueOnce({
          progress: 0.5,
          completed: false,
        } as any);

        await expect(
          pillController.answerPill(req as any, new AnswerRequestDto('123', '114', 'pepe')),
        ).resolves.toMatchObject<PillProgressResponseDto>({
          pill: {
            version: 1,
            completionTimeMinutes: 10,
            data: {
              progress: 0.5,
              completed: false,
            },
            id: '123',
            name: 'name',
            description: 'description',
            teacherComment: 'teacherComment',
          },
          teacher: undefined,
        });
      });
    });

    describe('getIntroduction', () => {
      it('should return introductionPill', async () => {
        (prismaService.pillVersion as any).findFirst.mockResolvedValueOnce({
          id: '1',
          pillId: '123',
          version: 1,
          completionTimeMinutes: 10,
        } as any);
        (springPillService as any).getSpringProgress.mockResolvedValueOnce({
          progress: 0.5,
          completed: false,
        } as any);

        await expect(pillController.getIntroduction(req as any)).resolves.toEqual({
          pill: {
            version: 1,
            completionTimeMinutes: 10,
            data: {
              progress: 0.5,
              completed: false,
            },
          },
          teacher: null,
        });
      });
    });
  });
});
