import { Controller, Get, Param, Request } from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { ApiRequest } from '../../../types/api-request.interface';

@Controller('api/trivia')
export class TriviaController {
  constructor(private readonly triviaService: TriviaService) {}

  @Get('/assign/:programId')
  async getTriviaMatch(@Request() req: ApiRequest, @Param('programId') programId: string) {
    return await this.triviaService.createOrAssignTriviaMatch(req.user, programId);
  }
}
