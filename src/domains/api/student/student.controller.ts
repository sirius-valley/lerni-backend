import {
  Body,
  Controller,
  HttpException,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { StudentRequestDto } from './dtos/student-request.dto';
import { StudentService } from './student.service';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';

@Controller('api/student')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('me')
  async createStudent(
    @Request() req: ApiRequest,
    @Body() studentDTO: StudentRequestDto,
  ) {
    if (req.user.id) throw new HttpException('Student already exists', 409);
    return await this.studentService.createStudent(studentDTO, req.user.authId);
  }
}
