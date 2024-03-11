import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ProfessorController } from './professor.controller';
import { ProfessorService } from './professor.service';
import { ProfessorRepository } from './professor.repository';
import { StudentModule } from '../student/student.module';

@Module({
  controllers: [ProfessorController],
  imports: [StudentModule],
  providers: [PrismaService, ProfessorService, ProfessorRepository, AttachStudentDataInterceptor],
  exports: [ProfessorService, ProfessorRepository],
})
export class ProfessorModule {}
