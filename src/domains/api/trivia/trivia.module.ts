import { Module } from '@nestjs/common';
import { TriviaController } from './trivia.controller';
import { TriviaService } from './trivia.service';
import { TriviaRepository } from './trivia.repository';
import { ProgramModule } from '../program/program.module';
import { PrismaService } from '../../../prisma.service';

@Module({
  controllers: [TriviaController],
  imports: [ProgramModule],
  providers: [TriviaService, TriviaRepository, PrismaService],
})
export class TriviaModule {}
