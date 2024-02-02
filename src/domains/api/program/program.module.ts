import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { ProgramRepository } from './program.repository';
import { PillModule } from '../pill/pill.module';
import { StudentModule } from '../student/student.module';

@Module({
  controllers: [ProgramController],
  imports: [PillModule, StudentModule],
  providers: [PrismaService, ProgramService, ProgramRepository],
  exports: [ProgramService, ProgramRepository],
})
export class ProgramModule {}
