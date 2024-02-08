import { Controller, Get, Param, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';
import { QuestionnaireService } from './questionnaire.service';

@Controller('api/questionnaire')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Questionnaire')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Get(':id')
  async getQuestionnaireById(@Request() req: ApiRequest, @Param('id') id: string) {
    return await this.questionnaireService.getQuestionnaireById((req.headers as any).authorization, req.user, id);
  }
}
