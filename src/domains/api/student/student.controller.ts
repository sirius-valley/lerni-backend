import { Body, Controller, Get, HttpCode, Param, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
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

  @Get('profile')
  async getStudentDetails(@Request() req: ApiRequest) {
    return await this.studentService.getStudentDetails(req.user);
  }

  @Post('check')
  async checkStudent(@Body() data: CheckStudent) {
    return await this.studentService.getStudentsByEmail(data.emails);
  }

  @Get('registered')
  @HttpCode(200)
  async getRegisteredStudents() {
    return this.studentService.getRegisteredStudents();
  }

  @Get('profile/:studentId')
  @HttpCode(200)
  async getStudentProfile(@Request() req: ApiRequest, @Param('studentId') studentId?: string) {
    return await this.studentService.getStudentProfile(req.user, studentId);
  }
}
