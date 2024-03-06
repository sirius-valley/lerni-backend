import { Body, Controller, Get, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { StudentService } from './student.service';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';
import { CheckStudent } from './dtos/student-check-request.sto';

@Controller('api/student')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me')
  async getStudentDetails(@Request() req: ApiRequest) {
    return await this.studentService.getStudentDetails(req.user);
  }

  @Post('check')
  async checkStudent(@Body() data: CheckStudent) {
    return await this.studentService.getStudentsByEmail(data.emails);
  }
}
