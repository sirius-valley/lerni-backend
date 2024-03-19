import { Controller, Get, Param, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { ApiRequest } from '../../../types/api-request.interface';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';

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

  @Get('/history')
  async getTriviaHistory(@Request() req: ApiRequest, @Query() query: any) {
    const { page } = query as Record<string, string>;
    return await this.triviaService.getTriviaHistory(req.user, Number(page));
  }

  @Get('/status')
  async getTriviaStatus(@Request() req: ApiRequest, @Query() query: any) {
    const { page } = query as Record<string, string>;
    return await this.triviaService.getTriviaStatus(req.user, Number(page));
  }
}
