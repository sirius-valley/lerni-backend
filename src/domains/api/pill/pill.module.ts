import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { PillController } from './pill.controller';
import { PillService } from './pill.service';
import { PillRepository } from './pill.repository';
import { StudentRepository } from '../student/student.repository';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../../../../config/configuration';

@Module({
  controllers: [PillController],
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
  ],
  providers: [
    PrismaService,
    PillService,
    PillRepository,
    StudentRepository,
    AttachStudentDataInterceptor,
  ],
  exports: [PillService, PillRepository],
})
export class PillModule {}
