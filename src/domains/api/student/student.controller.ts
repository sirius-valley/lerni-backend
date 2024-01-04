import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { StudentRequestDTO } from './dtos/StudentRequestDTO';
import { StudentService } from './student.service';

@Controller('api/student')
@UseGuards(JwtGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('me')
  async createStudent(
    @Request() req: any,
    @Body() studentDTO: StudentRequestDTO,
  ) {
    return await this.studentService.createStudent(studentDTO, req.user.authId);
  }
}
