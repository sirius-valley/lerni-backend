import { PillService } from './pill.service';
import { Controller, Get, Param, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';

@Controller('api/pill')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Pill')
export class PillController {
  constructor(private readonly pillService: PillService) {}

  @Get(':id')
  async getPillVersionByPillId(@Request() req: ApiRequest, @Param('id') id: string) {
    return await this.pillService.getPillVersionByPillId((req.headers as any).authorization, req.user, id);
  }
}
