import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { PillController } from './pill.controller';
import { PillService } from './pill.service';
import { PillRepository } from './pill.repository';
import { StudentRepository } from '../student/student.repository';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';

@Module({
  controllers: [PillController],
  imports: [SpringPillModule],
  providers: [PrismaService, PillService, PillRepository, StudentRepository, AttachStudentDataInterceptor],
  exports: [PillService, PillRepository],
})
export class PillModule {}