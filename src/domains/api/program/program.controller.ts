import { Body, Controller, Get, Param, Post, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProgramService } from './program.service';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';
import { CommentRequestDto } from './dtos/comment-request.dto';

@Controller('api/program')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Program')
export class ProgramController {
  constructor(private programService: ProgramService) {}

  @Get('home')
  async getProgramsByStudentId(@Request() req: ApiRequest) {
    return await this.programService.getProgramsByStudentId(req.user.id);
  }

  @Get(':id')
  async getProgramById(@Request() req: ApiRequest, @Param('id') id: string) {
    return await this.programService.getProgramById(req.user.id, id);
  }

  @Get(':id/comments')
  async getProgramComments(@Request() req: ApiRequest, @Param('id') id: string, @Query() query: any) {
    const { limit, before, after } = query as Record<string, string>;
    return await this.programService.getProgramComments(req.user.id, id, { limit: Number(limit), before, after });
  }

  @Post('comment')
  async createProgramComment(@Request() req: ApiRequest, @Body() commentRequest: CommentRequestDto) {
    return await this.programService.createProgramComment(req.user.id, commentRequest);
  }

  @Get('leaderboard/:programId')
  async getLeaderBoard(@Request() req: ApiRequest, @Param('programId') programId: string, @Query() query: any) {
    const { limit, offset } = query as Record<string, string>;
    return await this.programService.getLeaderBoard(req.user.id, programId, {
      limit: Number(limit),
      offset: Number(offset),
    });
  }
}
