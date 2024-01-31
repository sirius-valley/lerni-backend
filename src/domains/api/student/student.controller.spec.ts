import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { ConfigModule } from '@nestjs/config';
import { StudentModule } from './student.module';

process.env.NODE_ENV = 'development';

describe('StudentController', () => {
  let controller: StudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
        }),
        StudentModule,
      ],
      controllers: [StudentController],
    }).compile();

    controller = module.get<StudentController>(StudentController);
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
        profession: undefined,
        career: undefined,
        image: undefined,
        hasCompletedIntroduction: false,
      });
    });

    it('should return student details without necessary fields', async () => {
      // Arrange
      const req = {
        user: {
          id: 'studentId123',
          lastname: 'Doe',
          profession: 'Student',
          city: 'London',
          image: 'profile.jpg',
        },
      };

      // Act
      const result = await controller.getStudentDetails(req as any);

      // Assert
      expect(result).toEqual({
        id: 'studentId123',
        name: undefined,
        lastname: 'Doe',
        city: 'London',
        profession: 'Student',
        career: undefined,
        image: 'profile.jpg',
        hasCompletedIntroduction: false,
      });
    });
  });
});
