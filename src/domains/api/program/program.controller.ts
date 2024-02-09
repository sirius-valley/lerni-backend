import { Controller, Get, Param, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProgramService } from './program.service';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';

@Controller('api/program')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Program')
export class ProgramController {
  constructor(private programService: ProgramService) {}

  @Get(':id')
  async getProgramById(@Request() req: ApiRequest, @Param('id') id: string) {
    return await this.programService.getProgramById(req.user.id, id);
  }

  @Get('/home')
  async getProgramsByStudentId(@Request() req: ApiRequest) {
    return await this.programService.getProgramsByStudentId(req.user.id);
  }
}
