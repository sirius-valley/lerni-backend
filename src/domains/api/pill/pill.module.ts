import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { PillController } from './pill.controller';
import { PillService } from './pill.service';
import { PillRepository } from './pill.repository';
import { StudentRepository } from '../student/student.repository';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
import { StudentModule } from '../student/student.module';
import { HeadlandsAdapter } from './adapters/headlands.adapter';

@Module({
  controllers: [PillController],
  imports: [SpringPillModule, StudentModule],
  providers: [PrismaService, PillService, PillRepository, StudentRepository, HeadlandsAdapter],
  exports: [PillService, PillRepository],
})
export class PillModule {}
