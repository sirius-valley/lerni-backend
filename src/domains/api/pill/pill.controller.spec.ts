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
import { introductionTeacher } from '../../../const';
import { HeadlandsAdapter } from './adapters/headlands.adapter';
import { ThreadRequestDto } from './dtos/thread-request.dto';
import { PillBlockDto } from './dtos/pill-block.dto';
import { ElementType, FormType } from './interfaces/pill.interface';

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
      providers: [PillService, PillRepository, PrismaService, SpringPillService, HeadlandsAdapter],
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
        prismaService.pillSubmission.findFirst.mockResolvedValueOnce(null);

        await expect(pillController.getPillVersionByPillId(req as any, '123')).rejects.toThrow(
          new HttpException('Student does not have access to the pill', 404),
        );
      });

      it("should fail when pill-external-api doesn't respond", async () => {
        prismaService.pillSubmission.findFirst.mockResolvedValueOnce({
          pillVersion: {
            id: '1',
            pillId: '123',
            version: 1,
            completionTimeMinutes: 10,
            block: '{"elements": []}',
            progress: 0,
            pill: {
              id: '123',
              name: 'name',
              description: 'description',
              teacherComment: 'teacherComment',
            },
          },
          pillAnswers: [],
        } as any);
        prismaService.teacher.findFirst.mockResolvedValueOnce({
          id: '1',
          name: 'name',
          lastname: 'lastname',
          profession: 'profession',
        } as any);
        springPillService.getSpringProgress.mockRejectedValueOnce(new HttpException('Error while calculating progress', 500));

        await expect(pillController.getPillVersionByPillId(req as any, '123')).rejects.toThrow(
          new HttpException('Error while calculating progress', 500),
        );
      });
    });

    describe('answerPill', () => {
      it('should return pill version when pill exists', async () => {
        prismaService.pillSubmission.findFirst.mockResolvedValueOnce({
          pillVersion: {
            id: '1',
            pillId: '123',
            version: 1,
            completionTimeMinutes: 10,
            block: '{"elements": []}',
            progress: 0,
            pill: {
              id: '123',
              name: 'name',
              description: 'description',
              teacherComment: 'teacherComment',
            },
          },
          pillAnswers: [],
        } as any);
        prismaService.teacher.findFirst.mockResolvedValueOnce({
          id: '1',
          name: 'name',
          lastname: 'lastname',
          profession: 'profession',
          image: 'image',
        } as any);
        springPillService.answerPill.mockResolvedValueOnce({
          progress: 0.0,
          completed: false,
          nodes: [],
        } as any);

        await expect(
          pillController.answerPill(req as any, new AnswerRequestDto('123', '114', 'pepe')),
        ).resolves.toMatchObject<PillProgressResponseDto>({
          pill: {
            version: 1,
            completionTimeMinutes: 10,
            id: '123',
            name: 'name',
            description: 'description',
            teacherComment: 'teacherComment',
            completed: false,
            progress: 0,
            bubbles: [],
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

    describe('getIntroduction', () => {
      it('should return introductionPill', async () => {
        prismaService.pillVersion.findFirst.mockResolvedValueOnce({
          id: '1',
          pillId: '123',
          version: 1,
          completionTimeMinutes: 10,
          block: '{"elements": []}',
          pill: {
            id: '123',
            name: 'name',
            description: 'description',
            teacherComment: 'teacherComment',
          },
        } as any);
        springPillService.getSpringProgress.mockResolvedValueOnce({
          progress: 0.5,
          completed: false,
          nodes: [],
        } as any);

        await expect(pillController.getIntroduction(req as any)).resolves.toMatchObject<PillProgressResponseDto>({
          pill: {
            version: 1,
            completionTimeMinutes: 10,
            id: '123',
            name: 'name',
            description: 'description',
            teacherComment: 'teacherComment',
            completed: false,
            progress: 0.5,
            bubbles: [],
          },
          teacher: introductionTeacher,
        });
      });
    });
    describe('adaptThreadIntoPillBlock', () => {
      it('should return adaptedPillBlock', async () => {
        const thread = new ThreadRequestDto([
          {
            id: '3231c1f7-56f4-4c60-a474-9134970dc3bd',
            type: 'appear_together',
            branches: [
              {
                id: '03d97ddf-c5e3-4263-9ab7-a0db4de0d963',
                objects: [
                  {
                    id: '796c43a6-5cf7-442b-9d78-249ffe087d9f',
                    type: 'text',
                    value: '<p>Bienvenido</p>',
                  },
                  {
                    id: '4917003f-dad9-4fa1-839e-babdf94ea513',
                    type: 'text',
                    value:
                      '<p>Esta es una aplicacion que te va a ayudar a poder repasar, practicar y aprender de forma innovadora y adaptada a vos!</p>',
                  },
                  {
                    id: 'cfe7696d-6b3e-44c2-ac4d-fcab99ead69e',
                    type: 'text',
                    value: '<p>Para poder desbloquear los programas disponibles que tenemos para vos, necestamos conocerte</p>',
                  },
                ],
                test: {
                  var: '',
                },
              },
            ],
          },
        ]);
        await expect(pillController.adaptThreadToPillBlock(thread)).resolves.toMatchObject<PillBlockDto>({
          pillBlock: {
            id: '',
            type: FormType.DYNAMIC,
            initial: '796c43a6-5cf7-442b-9d78-249ffe087d9f',
            elements: [
              {
                id: '796c43a6-5cf7-442b-9d78-249ffe087d9f',
                type: ElementType.ACTION,
                name: '<p>Bienvenido</p>',
              },
              {
                id: '4917003f-dad9-4fa1-839e-babdf94ea513',
                type: ElementType.ACTION,
                name: '<p>Esta es una aplicacion que te va a ayudar a poder repasar, practicar y aprender de forma innovadora y adaptada a vos!</p>',
              },
              {
                id: 'cfe7696d-6b3e-44c2-ac4d-fcab99ead69e',
                type: ElementType.ACTION,
                name: '<p>Para poder desbloquear los programas disponibles que tenemos para vos, necestamos conocerte</p>',
              },
            ],
            relations: [
              {
                from: '796c43a6-5cf7-442b-9d78-249ffe087d9f',
                to: '4917003f-dad9-4fa1-839e-babdf94ea513',
              },
              { from: '4917003f-dad9-4fa1-839e-babdf94ea513', to: 'cfe7696d-6b3e-44c2-ac4d-fcab99ead69e' },
            ],
          },
        });
      });
      it('should return 400 when thread not valid', async () => {
        await expect(pillController.adaptThreadToPillBlock(new ThreadRequestDto({ id: '1' }))).rejects.toThrow(
          new HttpException('Thread does not follow required format', 400),
        );
      });
    });
  });
});
