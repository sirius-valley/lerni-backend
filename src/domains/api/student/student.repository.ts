import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
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

  async findStudentByEmail(email: string): Promise<any[]> {
    const data = await this.prisma.student.findMany({
      where: {
        auth: {
          email,
        },
      },
    });
    return data;
  }
}
