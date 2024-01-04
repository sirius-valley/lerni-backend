import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { PrismaService } from '../../../prisma.service';
import { StudentService } from './student.service';
import { StudentRepository } from './student.repository';

@Module({
  controllers: [StudentController],
  providers: [PrismaService, StudentService, StudentRepository],
  exports: [StudentService],
})
export class StudentModule {}
