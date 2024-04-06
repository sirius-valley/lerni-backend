import { Module } from '@nestjs/common';
import { TriviaController } from './trivia.controller';
import { TriviaService } from './trivia.service';
import { TriviaRepository } from './trivia.repository';
import { ProgramModule } from '../program/program.module';
import { PrismaService } from '../../../prisma.service';
import { StudentModule } from '../student/student.module';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
import { HeadlandsAdapter } from '../pill/adapters/headlands.adapter';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [TriviaController],
  imports: [ProgramModule, StudentModule, SpringPillModule, NotificationModule],
  providers: [TriviaService, TriviaRepository, PrismaService, HeadlandsAdapter],
})
export class TriviaModule {}
