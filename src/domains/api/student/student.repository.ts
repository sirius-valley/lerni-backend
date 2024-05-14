import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { SimpleEmptyStudentDto } from './dtos/simple-empty-student.dto';
import { SimpleStudentDto } from './dtos/simple-student.dto';
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
    return data
      ? new StudentDto({ ...data, email: email } as StudentDto)
      : new SimpleEmptyStudentDto({ email: email } as SimpleEmptyStudentDto);
  }

  async getTotalPoints(studentId: string) {
    const totalPoints = await this.prisma.pointRecord.findMany({
      where: { studentId },
    });
    return totalPoints.reduce((acc, point) => acc + point.amount, 0);
  }

  async findStudentById(id: string): Promise<SimpleStudentDto | null> {
    const student = await this.prisma.student.findUnique({
      where: {
        id,
      },
    });
    return student ? new SimpleStudentDto(student as SimpleStudentDto) : null;
  }

  async enrollStudent(studentId: string, programVersionId: string) {
    try {
      return await this.prisma.studentProgram.create({
        data: {
          studentId,
          programVersionId,
        },
      });
    } catch {
      console.log('Error enrolling student');
    }
  }

  async addPoints(studentId: string, amount: number, entityId: string, sourceEntity: string) {
    return this.prisma.pointRecord.create({
      data: {
        studentId,
        amount,
        entityId,
        sourceEntity,
      },
    });
  }
}
