import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { ConfigModule } from '@nestjs/config';
import { StudentModule } from './student.module';
import { PrismaService } from '../../../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

process.env.NODE_ENV = 'development';

describe('StudentController', () => {
  let controller: StudentController;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
        }),
        StudentModule,
      ],
      controllers: [StudentController],
      providers: [PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    controller = module.get<StudentController>(StudentController);
    prismaService = module.get(PrismaService);
  });

  describe('getStudentDetails', () => {
    it('should return student details', async () => {
      // Arrange
      const req = {
        user: {
          id: 'studentId123',
          name: 'John',
          lastname: 'Doe',
          profession: 'Student',
          city: 'London',
          image: 'profile.jpg',
        },
      };

      prismaService.pointRecord.findMany.mockResolvedValueOnce([]);
      //mock raw query
      prismaService.$queryRaw.mockResolvedValueOnce([{ ranking: 0 }]);

      // Assert
      await expect(controller.getStudentDetails(req as any)).resolves.toEqual({
        id: 'studentId123',
        name: 'John',
        lastname: 'Doe',
        profession: 'Student',
        career: undefined,
        city: 'London',
        image: 'profile.jpg',
        hasCompletedIntroduction: true,
        points: 0,
        ranking: 0,
      });
    });

    it('should return student details without optional fields', async () => {
      // Arrange
      const req = {
        user: {
          id: 'studentId123',
          name: 'John',
          lastname: 'Doe',
          city: 'London',
          profession: null,
          career: null,
          image: null,
        },
      };

      // Act
      const result = await controller.getStudentDetails(req as any);

      // Assert
      expect(result).toEqual({
        id: 'studentId123',
        name: 'John',
        lastname: 'Doe',
        city: 'London',
        profession: null,
        career: null,
        image: null,
        hasCompletedIntroduction: false,
        points: 0,
        ranking: 0,
      });
    });

    it('should return student details without necessary fields', async () => {
      // Arrange
      const req = {
        user: {
          id: 'studentId123',
          name: null,
          lastname: 'Doe',
          profession: 'Student',
          city: 'London',
          career: null,
          image: 'profile.jpg',
        },
      };

      // Act
      const result = await controller.getStudentDetails(req as any);

      // Assert
      expect(result).toEqual({
        id: 'studentId123',
        name: null,
        lastname: 'Doe',
        city: 'London',
        profession: 'Student',
        career: null,
        image: 'profile.jpg',
        hasCompletedIntroduction: false,
        points: 0,
        ranking: 0,
      });
    });
  });
});
