import { Injectable } from '@nestjs/common';
import { StudentDto } from './dtos/student.dto';
import { StudentDetailsDto } from './dtos/student-details.dto';
import { necessaryFields, optionalFields } from '../../../const';
import { StudentRepository } from './student.repository';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepository: StudentRepository) {}

  public async getStudentDetails(studentDto: StudentDto) {
    if (!studentDto) return new StudentDetailsDto(studentDto, false);

    if (!this.checkNecessaryFields(studentDto, necessaryFields)) return new StudentDetailsDto(studentDto, false);
    if (!this.checkOptionalFields(studentDto, optionalFields)) return new StudentDetailsDto(studentDto, false);
    return new StudentDetailsDto(studentDto, true);
  }

  private checkNecessaryFields(studentDto: StudentDto, necessaryFields: string[]) {
    return necessaryFields.every((field) => studentDto[field]);
  }

  private checkOptionalFields(studentDto: StudentDto, optionalFields: string[]) {
    return optionalFields.some((field) => studentDto[field]);
  }

  public async getStudentByEmail(emails: string[]) {
    return await emails.map((email) => {
      return this.studentRepository.findStudentByEmail(email);
    });
    // if (data.length === 0) return [Object.assign({}, new SimpleEmptyStudentDto())];
    // return data.map((item) => new StudentDto(item));
  }
}
