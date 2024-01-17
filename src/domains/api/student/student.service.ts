import { Injectable } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { StudentRequestDto } from './dtos/student-request.dto';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepository: StudentRepository) {}

  public async createStudent(studentDTO: StudentRequestDto, authId: string) {
    return await this.studentRepository.createStudent(studentDTO, authId);
  }
}
