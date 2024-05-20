import { Controller, Get, HttpCode, Param, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { ApiRequest } from '../../../types/api-request.interface';

@Controller('api/achievement')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get('')
  async getAllAchievements(@Request() req: ApiRequest) {
    return this.achievementService.getAchievementsByStudentId(req.user.id);
  }

  @Get('recent')
  async getRecentStudentAchievements(@Request() req: ApiRequest) {
    return this.achievementService.getRecentAchievementsCompletedByStudentId(req.user.id);
  }

  @Get('recent/:studentId')
  @HttpCode(200)
  async getRecentStudentAchievementsByStudentId(@Request() req: ApiRequest, @Param('studentId') studentId: string) {
    return this.achievementService.getRecentAchievementsCompletedByStudentId(studentId);
  }

  @Get(':studentId')
  @HttpCode(200)
  async getStudentAchievements(@Request() req: ApiRequest, @Param('studentId') studentId: string) {
    return this.achievementService.getAchievementsByStudentId(studentId);
  }
}
