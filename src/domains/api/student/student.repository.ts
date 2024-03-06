import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { SimpleEmptyStudentDto } from './dtos/simple-empty-student.dto';
import { StudentDto } from './dtos/student.dto';

@Injectable()
export class StudentRepository {
  constructor(private prisma: PrismaService) {}

  async findStudentByAuthId(authId: string): Promise<StudentDto | null> {
    const student = await this.prisma.student.findUnique({
      where: { authId },
    });
    return student ? new StudentDto(student as StudentDto) : null;
  }

  async updateStudent(studentId: string, field: string, value: string) {
    const student = await this.prisma.student.update({
      where: { id: studentId },
      data: {
        [field]: value,
      },
    });
    return student ? new StudentDto(student as StudentDto) : null;
  }

  async findStudentByEmail(email: string): Promise<StudentDto | SimpleEmptyStudentDto> {
    const data = await this.prisma.student.findFirst({
      where: {
        auth: {
          email,
        },
      },
    });
    return data ? new StudentDto(data as StudentDto) : new SimpleEmptyStudentDto({ email: email } as SimpleEmptyStudentDto);
  }
}
