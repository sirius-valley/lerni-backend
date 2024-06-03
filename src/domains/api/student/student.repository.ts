import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { SimpleEmptyStudentDto } from './dtos/simple-empty-student.dto';
import { SimpleStudentDto } from './dtos/simple-student.dto';
import { StudentDto } from './dtos/student.dto';
import { introductionID } from '../../../const';

@Injectable()
export class StudentRepository {
  constructor(private prisma: PrismaService) {}

  async findStudentByAuthId(authId: string): Promise<StudentDto | null> {
    const student = await this.prisma.student.findUnique({
      where: { authId },
    });
    return student ? new StudentDto(student as StudentDto) : null;
  }

  async updateStudent(studentId: string, data: Partial<StudentDto>): Promise<StudentDto | null> {
    const student = await this.prisma.student.update({
      where: { id: studentId },
      data: {
        ...data,
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

  async findIntroductionPillSubmissionByStudentId(studentId: string) {
    return this.prisma.pillSubmission.findFirst({
      where: {
        studentId,
        pillVersionId: introductionID,
      },
    });
  }

  async findStudentById(id: string): Promise<SimpleStudentDto | null> {
    const student = await this.prisma.student.findUnique({
      where: {
        id,
      },
    });
    return student ? new SimpleStudentDto(student as SimpleStudentDto) : null;
  }

  async findStudentByIdSelectStudentDto(id: string): Promise<StudentDto | null> {
    const student = await this.prisma.student.findUnique({
      where: {
        id,
      },
    });
    return student ? new StudentDto(student as StudentDto) : null;
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
    return this.prisma.student.update({
      where: {
        id: studentId,
      },
      data: {
        pointCount: {
          increment: amount,
        },
        points: {
          create: {
            amount,
            entityId,
            sourceEntity,
          },
        },
      },
    });
  }

  async getRegisteredStudents() {
    return this.prisma.student.count({
      where: {
        name: {
          not: null,
        },
        lastname: {
          not: null,
        },
        city: {
          not: null,
        },
        image: {
          not: null,
        },
        OR: [
          {
            career: {
              not: null,
            },
          },
          {
            profession: {
              not: null,
            },
          },
        ],
      },
    });
  }
}
