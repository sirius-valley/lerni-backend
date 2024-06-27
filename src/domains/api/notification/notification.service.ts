import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand, CreatePlatformEndpointCommand } from '@aws-sdk/client-sns';
import { NotificationDto } from './dto/notification.dto';
import { InputNotificationDto } from './dto/input-notification.dto';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  public async sendNotification(params: NotificationDto) {
    const client = await new SNSClient();
    const user = await this.notificationRepository.searchToken(params.userId);
    if (!user) return undefined;

    if (!user.tokenDevice) return undefined;

    const payload = JSON.stringify(
      new InputNotificationDto({ default: 'default', body: params.message, title: params.title, sound: 'default' }),
    );

    const params_sns = {
      Message: payload,
      TargetArn: user.tokenDevice,
      MessageStructure: 'json',
    };

    try {
      const command = new PublishCommand(params_sns);
      const response = await client.send(command);
      return response.MessageId;
    } catch (error) {
      throw new HttpException(`Can't send notification ${error?.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  public async publishNotification(input: any) {
    const command = new PublishCommand(input);
    const client = await new SNSClient();
    return await client.send(command);
  }

  public async saveToken(id: string, token: string) {
    const client = await new SNSClient();
    const input = {
      PlatformApplicationArn: process.env.AWS_TOPIC_ARN,
      Token: token,
    };
    const command = new CreatePlatformEndpointCommand(input);
    const response_sns = await client.send(command);
    if (!response_sns.EndpointArn) throw new HttpException('AWS ERROR', HttpStatus.BAD_REQUEST);
    const response = this.notificationRepository.updateToken(id, response_sns.EndpointArn);
    if (!response) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return 'OK';
  }

  public async removeToken(authId: string) {
    await this.notificationRepository.updateToken(authId, '');
    return;
  }
}
