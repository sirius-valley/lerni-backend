import { PillService } from './pill.service';
import { Body, Controller, Get, Param, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';
import { AnswerRequestDto } from './dtos/answer-request.dto';
import { ThreadRequestDto } from './dtos/thread-request.dto';

@Controller('api/pill')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Pill')
export class PillController {
  constructor(private readonly pillService: PillService) {}

  @Get('introduction')
  async getIntroduction(@Request() req: ApiRequest) {
    return await this.pillService.getIntroduction((req.headers as any).authorization, req.user);
  }

  @Get(':id')
  async getPillVersionByPillId(@Request() req: ApiRequest, @Param('id') id: string) {
    return await this.pillService.getPillVersionByPillId((req.headers as any).authorization, req.user, id);
  }

  @Post('/answer')
  async answerPill(@Request() req: ApiRequest, @Body() answerRequest: AnswerRequestDto) {
    return await this.pillService.answerPill((req.headers as any).authorization, req.user, answerRequest);
  }

  @Post('/adaptToPill')
  async adaptThreadToPillBlock(@Body() thread: ThreadRequestDto) {
    return await this.pillService.adaptHeadlandsThreadToPillBlock(thread);
  }
}
