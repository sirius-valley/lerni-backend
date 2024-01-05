import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { StudentRequestDTO } from './dtos/StudentRequestDTO';
import { StudentDTO } from './dtos/StudentDTO';

@Injectable()
export class StudentRepository {
  constructor(private prisma: PrismaService) {}

  async createStudent(
    data: StudentRequestDTO,
    authId: string,
  ): Promise<StudentDTO> {
    const student = await this.prisma.student.create({
      data: {
        ...data,
        auth: { connect: { id: authId } },
      },
    });
    return new StudentDTO(student);
  }

  async findStudentByAuthId(authId: string): Promise<StudentDTO | null> {
    const student = await this.prisma.student.findUnique({
      where: { authId },
    });
    return student ? new StudentDTO(student) : null;
  }
}
