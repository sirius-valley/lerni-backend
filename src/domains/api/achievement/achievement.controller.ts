import { Controller, Get, Request, UseGuards, UseInterceptors } from '@nestjs/common';
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
}
