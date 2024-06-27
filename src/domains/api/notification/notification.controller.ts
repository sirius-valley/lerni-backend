import { Body, Controller, HttpCode, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';
import { AttachStudentDataInterceptor } from '../../../interceptors/attach-student-data.interceptor';
import { NotificationService } from './notification.service';
import { NotificationDto } from './dto/notification.dto';
import { NewTokenDto } from './dto/new-token.notification.dto';

@Controller('api/notification')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async notification(@Request() req: ApiRequest, @Body() request: NotificationDto) {
    return await this.notificationService.sendNotification(request);
  }

  @Post('token')
  async updateToken(@Request() req: ApiRequest, @Body() request: NewTokenDto) {
    return this.notificationService.saveToken(req.user.authId, request.token);
  }

  @Post('remove-token')
  @HttpCode(200)
  async removeToken(@Request() req: ApiRequest) {
    return this.notificationService.removeToken(req.user.authId);
  }
}
