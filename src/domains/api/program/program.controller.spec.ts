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

describe('PillController', () => {
  let programController: ProgramController;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [StudentModule, SpringPillModule, PillModule],
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

      it('Should return the program Version the user is related with', async () => {
        prismaService.program.findFirst.mockResolvedValueOnce(null);
        const req: ApiRequest = {
          user: {
            id: '1',
            authId: '',
          },
        } as any;

        prismaService.studentProgram.findFirst.mockResolvedValueOnce({
          id: '1',
          programVersion: {
            id: '1',
            objectives: [],
            program: {
              pointsReward: 15,
              hoursToComplete: 3,
              name: 'name',
              description: 'description',
              icon: 'icon',
              id: '1',
              teacher: {
                id: '1',
                name: 'teacher',
                lastname: 'lastname',
                profession: 'profession',
                image: 'image',
              },
            },
          },
        } as any);

        prismaService.programVersion.findFirst.mockResolvedValueOnce({
          id: '2',
          programVersion: {
            id: '2',
            objectives: [
              {
                id: '1',
                name: 'Objective 1',
                createdAt: '2024-02-05T12:00:00Z',
              },
              {
                id: '2',
                name: 'Objective 2',
                createdAt: '2024-02-05T12:30:00Z',
              },
            ],
            program: {
              pointsReward: 20,
              hoursToComplete: 5,
              name: 'Another Program',
              description: 'Another Description',
              icon: 'another-icon',
              id: '2',
              teacher: {
                id: '2',
                name: 'Another Teacher',
                lastname: 'Surname',
                profession: 'Another Profession',
                image: 'another-image',
              },
            },
          },
        } as any);

        prismaService.programVersionPillVersion.findMany.mockResolvedValueOnce([
          {
            id: '1',
            pillVersion: {
              id: '1',
              pill: {
                id: '1',
                name: 'pill 1',
              },
              pillSubmissions: [
                {
                  id: '1',
                  createdAt: new Date(),
                  progress: 15,
                },
              ],
            },
            order: 1,
          },
          {
            id: '4',
            pillVersion: {
              id: '4',
              pill: {
                id: '4',
                name: 'pill 1',
              },
              pillSubmissions: [
                {
                  id: '4',
                  createdAt: new Date(),
                  progress: 100,
                },
              ],
            },
            order: 2,
          },
        ] as any);

        await expect(programController.getProgramById(req, '123')).resolves.toEqual({
          estimatedHours: 3,
          icon: 'icon',
          id: '1',
          pillCount: 2,
          pills: [
            {
              id: '1',
              pillName: 'pill 1',
              pillProgress: 15,
            },
            {
              id: '4',
              pillName: 'pill 1',
              pillProgress: 100,
            },
          ],
          points: 15,
          programDescription: 'description',
          programName: 'name',
          programObjectives: [],
          progress: 57.5,
          teacher: {
            id: '1',
            image: 'image',
            lastname: 'lastname',
            name: 'teacher',
            profession: 'profession',
          },
        });
      });

      it('Should return the last program version when user has no relation with the program', async () => {
        prismaService.program.findFirst.mockResolvedValueOnce(null);
        const req: ApiRequest = {
          user: {
            id: '1',
            authId: '',
          },
        } as any;

        prismaService.studentProgram.findFirst.mockResolvedValueOnce(null);

        prismaService.programVersion.findFirst.mockResolvedValueOnce({
          id: '2',
          objectives: [
            {
              id: '1',
              name: 'Objective 1',
              createdAt: '2024-02-05T12:00:00Z',
            },
            {
              id: '2',
              name: 'Objective 2',
              createdAt: '2024-02-05T12:30:00Z',
            },
          ],
          program: {
            pointsReward: 20,
            hoursToComplete: 5,
            name: 'Another Program',
            description: 'Another Description',
            icon: 'another-icon',
            id: '2',
            teacher: {
              id: '2',
              name: 'Another Teacher',
              lastname: 'Surname',
              profession: 'Another Profession',
              image: 'another-image',
            },
          },
        } as any);

        prismaService.programVersionPillVersion.findMany.mockResolvedValueOnce([
          {
            id: '1',
            pillVersion: {
              id: '1',
              pill: {
                id: '1',
                name: 'pill 1',
              },
              pillSubmissions: [
                {
                  id: '1',
                  createdAt: new Date(),
                  progress: 15,
                },
              ],
            },
            order: 1,
          },
          {
            id: '4',
            pillVersion: {
              id: '4',
              pill: {
                id: '4',
                name: 'pill 1',
              },
              pillSubmissions: [
                {
                  id: '4',
                  createdAt: new Date(),
                  progress: 100,
                },
              ],
            },
            order: 2,
          },
        ] as any);

        await expect(programController.getProgramById(req, '123')).resolves.toEqual({
          estimatedHours: 5,
          icon: 'another-icon',
          id: '2',
          pillCount: 2,
          pills: [
            {
              id: '1',
              pillName: 'pill 1',
              pillProgress: 15,
            },
            {
              id: '4',
              pillName: 'pill 1',
              pillProgress: 100,
            },
          ],
          points: 20,
          programDescription: 'Another Description',
          programName: 'Another Program',
          programObjectives: ['Objective 1', 'Objective 2'],
          progress: 57.5,
          teacher: {
            id: '2',
            image: 'another-image',
            lastname: 'Surname',
            name: 'Another Teacher',
            profession: 'Another Profession',
          },
        });
      });
    });
  });
});
