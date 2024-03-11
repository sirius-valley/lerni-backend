import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttachStudentDataInterceptor } from 'src/interceptors/attach-student-data.interceptor';
import { ProfessorService } from './professor.service';
import { ProfessorRequestDto } from './dto/professor-request.dto';

@Controller('api/professor')
@UseGuards(JwtGuard)
@ApiBearerAuth('JWT-auth')
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Professor')
export class ProfessorController {
  constructor(private readonly professorService: ProfessorService) {}

  @Post('create')
  async create(@Body() professorRequest: ProfessorRequestDto): Promise<any> {
    return await this.professorService.create(professorRequest);
  }

  @Get('')
  async getProfessor() {
    return await this.professorService.getProfessors();
  }
}
