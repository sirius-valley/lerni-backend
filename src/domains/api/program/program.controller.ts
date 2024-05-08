import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProgramService } from './program.service';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';
import { CommentRequestDto } from './dtos/comment-request.dto';
import { ProgramRequestDto } from './dtos/program-request.dto';
import { ProgramUpdateRequestDto } from './dtos/program-update.dto';
import { ProgramListResponseDto } from './dtos/program-list.dto';

@Controller('api/program')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Program')
export class ProgramController {
  constructor(private programService: ProgramService) {}

  @Get('home/:status')
  async getProgramsByStudentId(@Request() req: ApiRequest, @Param('status') status: string, @Query() query: any) {
    const { limit, offset } = query as Record<string, string>;
    return await this.programService.getProgramsByStudentId(req.user.id, status, { limit: Number(limit), offset: Number(offset) });
  }

  @Get('list')
  @ApiQuery({ name: 'limit', type: Number })
  @ApiQuery({ name: 'offset', type: Number })
  async getProgramList(@Request() req: ApiRequest, @Query() query: any): Promise<ProgramListResponseDto> {
    const { limit, offset } = query as Record<string, string>;
    return await this.programService.getProgramList({
      limit: Number(limit),
      offset: Number(offset),
    });
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

  @Post('')
  async newProgram(@Request() req: ApiRequest, @Body() newProgram: ProgramRequestDto) {
    return await this.programService.createProgram(newProgram);
  }

  @Get('detail/:programVersionId')
  async getProgramDetail(@Param('programVersionId') id: string) {
    return await this.programService.getProgramDetail(id);
  }

  @Get('likes/:programVersionId')
  async getLikesAndDislikes(@Param('programVersionId') programVersionId: string) {
    return await this.programService.getLikesAndDislikes(programVersionId);
  }

  @Get('students/:programVersionId')
  async getProgramStudents(@Request() req: ApiRequest, @Param('programVersionId') programVersionId: string) {
    return await this.programService.getProgramVersionStudents(programVersionId);
  }

  @Put(':programVersionId')
  async update(@Param('programVersionId') id: string, @Body() data: ProgramUpdateRequestDto) {
    return this.programService.update(id, data);
  }

  @Get('questionnaires/:programVersionId')
  async getQuestionnaireAttempts(@Request() req: ApiRequest, @Param('programVersionId') programVersionId: string) {
    return await this.programService.getQuestionnaireAttemptsQuantity(programVersionId);
  }
}
