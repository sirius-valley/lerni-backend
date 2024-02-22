import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { ProgramRepository } from './program.repository';
import { StudentModule } from '../student/student.module';

@Module({
  controllers: [ProgramController],
  imports: [StudentModule],
  providers: [PrismaService, ProgramService, ProgramRepository],
  exports: [ProgramService, ProgramRepository],
})
export class ProgramModule {}
