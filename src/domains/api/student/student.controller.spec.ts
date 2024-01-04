import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentRequestDTO } from './dtos/StudentRequestDTO';

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
      const studentDTO: StudentRequestDTO = {
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
      await controller.createStudent(req, studentDTO);

      // Assert
      expect(studentService.createStudent).toHaveBeenCalledWith(
        studentDTO,
        'authId123',
      );
    });
  });
});
