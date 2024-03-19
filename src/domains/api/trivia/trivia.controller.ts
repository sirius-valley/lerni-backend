import { Body, Controller, Get, Param, Post, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { ApiRequest } from '../../../types/api-request.interface';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { TriviaAnswerRequestDto } from './dto/trivia-answer-request.dto';

@Controller('api/trivia')
@UseGuards(JwtGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('trivia')
@UseInterceptors(AttachStudentDataInterceptor)
export class TriviaController {
  constructor(private readonly triviaService: TriviaService) {}

  @Get('assign/:programId')
  async getTriviaMatch(@Request() req: ApiRequest, @Param('programId') programId: string) {
    return await this.triviaService.createOrAssignTriviaMatch(req.user, programId);
  }

  @Get('question/:triviaMatchId')
  async getQuestion(@Request() req: ApiRequest, @Param('triviaMatchId') triviaMatchId: string) {
    return await this.triviaService.getQuestion((req.headers as any).authorization, req.user, triviaMatchId);
  }

  @Get('/history')
  async getTriviaHistory(@Request() req: ApiRequest, @Query() query: any) {
    const { page } = query as Record<string, string>;
    return await this.triviaService.getTriviaHistory(req.user, Number(page));
  }

  @Post('answer')
  async answerTrivia(@Request() req: ApiRequest, @Body() answerRequest: TriviaAnswerRequestDto) {
    return await this.triviaService.answerTrivia(req.user, answerRequest, (req.headers as any).authorization);
  }
}
