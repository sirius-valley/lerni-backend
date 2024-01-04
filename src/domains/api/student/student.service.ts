import { Injectable } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { StudentRequestDTO } from './dtos/StudentRequestDTO';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepository: StudentRepository) {}

  public async createStudent(studentDTO: StudentRequestDTO, authId: string) {
    return await this.studentRepository.createStudent(studentDTO, authId);
  }
}
