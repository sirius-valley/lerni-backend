import { Module } from '@nestjs/common';
import { TriviaController } from './trivia.controller';
import { TriviaService } from './trivia.service';
import { TriviaRepository } from './trivia.repository';
import { ProgramModule } from '../program/program.module';
import { PrismaService } from '../../../prisma.service';
import { StudentModule } from '../student/student.module';

@Module({
  controllers: [TriviaController],
  imports: [ProgramModule, StudentModule],
  providers: [TriviaService, TriviaRepository, PrismaService],
})
export class TriviaModule {}
