import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentRequestDto } from './dtos/student-request.dto';
import { HttpException } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { PrismaService } from '../../../prisma.service';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiRequest } from '../../../types/api-request.interface';

describe('StudentController', () => {
  let controller: StudentController;
  let studentService: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [
        {
          provide: StudentService,
          useValue: {
            createStudent: jest.fn(),
          },
        },
        StudentRepository,
        PrismaService,
        AttachStudentDataInterceptor,
      ],
    }).compile();

    controller = module.get<StudentController>(StudentController);
    studentService = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createStudent', () => {
    it('should create a new student', async () => {
      // Arrange
      const studentDTO: StudentRequestDto = {
        name: 'John',
        lastname: 'Doe',
        profession: 'Student',
        image: 'profile.jpg',
      };

      const req = {
        user: {
          authId: 'authId123',
        },
      };

      // Act
      await controller.createStudent(req as any, studentDTO);

      // Assert
      expect(studentService.createStudent).toHaveBeenCalledWith(studentDTO, 'authId123');
    });

    it('should throw an error if student already exists', async () => {
      // Arrange
      const studentDTO: StudentRequestDto = {
        name: 'John',
        lastname: 'Doe',
        profession: 'Student',
        image: 'profile.jpg',
      };

      const req = {
        user: {
          authId: 'authId123',
          id: 'studentId123',
        },
      };

      // Act and Assert
      await expect(controller.createStudent(req as any, studentDTO)).rejects.toThrow(HttpException);
    });
  });
});
