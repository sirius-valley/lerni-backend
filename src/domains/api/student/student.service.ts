import { Injectable } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { StudentRequestDto } from './dtos/student-request.dto';
import { StudentDto } from './dtos/student.dto';
import { StudentDetailsDto } from './dtos/student-details.dto';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepository: StudentRepository) {}

  public async createStudent(studentDTO: StudentRequestDto, authId: string) {
    return await this.studentRepository.createStudent(studentDTO, authId);
  }

  public async getStudentDetails(studentDto: StudentDto) {
    if (!studentDto) return new StudentDetailsDto(studentDto, false);
    const necessaryFields = ['name', 'lastname', 'city'];
    const optionalFields = ['profession', 'career'];
    if (!(await this.CheckNecessaryFields(studentDto, necessaryFields))) return new StudentDetailsDto(studentDto, false);
    if (!(await this.CheckOptionalFields(studentDto, optionalFields))) return new StudentDetailsDto(studentDto, false);
    return new StudentDetailsDto(studentDto, true);
  }

  private async CheckNecessaryFields(studentDto: StudentDto, necessaryFields: string[]) {
    return necessaryFields.every((field) => studentDto[field]);
  }

  private async CheckOptionalFields(studentDto: StudentDto, optionalFields: string[]) {
    return optionalFields.some((field) => studentDto[field]);
  }
}
