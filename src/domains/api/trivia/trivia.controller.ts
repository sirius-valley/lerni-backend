import { Controller, Get, Param, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { ApiRequest } from '../../../types/api-request.interface';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';

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

  @Get('quesion/:triviaMatchId')
  async getQuestion(@Request() req: ApiRequest, @Param('triviaMatchId') triviaMatchId: string) {
    return await this.triviaService.getQuestion((req.headers as any).authorization, req.user, triviaMatchId);
  }
}
