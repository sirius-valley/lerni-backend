import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { ApiRequest } from '../../../types/api-request.interface';

@Controller('api/trivia')
export class TriviaController {
  constructor(private readonly triviaService: TriviaService) {}

  @Get('/assign/:programId')
  async getTriviaMatch(@Request() req: ApiRequest, @Param('programId') programId: string) {
    return await this.triviaService.createOrAssignTriviaMatch(req.user, programId);
  }

  @Get('/history')
  async getTriviaHistory(@Request() req: ApiRequest, @Query() query: any) {
    const { page } = query as Record<string, string>;
    return await this.triviaService.getTriviaHistory(req.user, Number(page));
  }
}
