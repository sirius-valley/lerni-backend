import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { StudentRequestDto } from './dtos/student-request.dto';
import { StudentDto } from './dtos/student.dto';

@Injectable()
export class StudentRepository {
  constructor(private prisma: PrismaService) {}

  async createStudent(data: StudentRequestDto, authId: string): Promise<StudentDto> {
    const student = await this.prisma.student.create({
      data: {
        ...data,
        auth: { connect: { id: authId } },
      },
    });
    return new StudentDto(student);
  }

  async findStudentByAuthId(authId: string): Promise<StudentDto | null> {
    const student = await this.prisma.student.findUnique({
      where: { authId },
    });
    return student ? new StudentDto(student) : null;
  }
}