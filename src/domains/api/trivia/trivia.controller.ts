import { Body, Controller, Get, Param, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { ApiRequest } from '../../../types/api-request.interface';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { TriviaAnswerRequestDto } from './dto/trivia-answer-request.dto';

@Controller('api/trivia')
@UseGuards(JwtGuard)
@ApiBearerAuth('JWT-auth')
@UseInterceptors(AttachStudentDataInterceptor)
export class TriviaController {
  constructor(private readonly triviaService: TriviaService) {}

  @Get('assign/:programId')
  async getTriviaMatch(@Request() req: ApiRequest, @Param('programId') programId: string) {
    return await this.triviaService.createOrAssignTriviaMatch(req.user, programId);
  }

  @Post('answer')
  async answerTrivia(@Request() req: ApiRequest, @Body() answerRequest: TriviaAnswerRequestDto) {
    return await this.triviaService.answerTrivia(req.user, answerRequest, (req.headers as any).authorization);
  }
}
