import { Body, Controller, Get, Param, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';

import { ApiRequest } from '../../../types/api-request.interface';
import { QuestionnaireService } from './questionnaire.service';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { QuestionnaireAnswerRequestDto } from './dtos/questionnaire-answer-request.dto';

@Controller('api/questionnaire')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post('answer')
  async answerQuestionnaire(@Request() req: ApiRequest, @Body() answerRequest: QuestionnaireAnswerRequestDto) {
    return await this.questionnaireService.answerQuestionnaire((req.headers as any).authorization, req.user, answerRequest);
  }

  @Get(':id')
  async getQuestionnaireVersionById(@Request() req: ApiRequest, @Param('id') id: string) {
    return await this.questionnaireService.getQuestionnaireVersionByPillId((req.headers as any).authorization, req.user, id);
  }
}
