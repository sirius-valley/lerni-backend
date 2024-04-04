import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand, CreatePlatformEndpointCommand } from '@aws-sdk/client-sns';
import { NotificationDto } from './dto/notification.dto';
import { InputNotificationDto } from './dto/input-notification.dto';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  client: SNSClient;
  constructor(private readonly notificationRepository: NotificationRepository) {
    this.client = new SNSClient();
  }

  public async sendNotification(params: NotificationDto) {
    const token = await this.notificationRepository.searchToken(params.userId);
    if (!token) throw new HttpException('Token not Found', HttpStatus.NOT_FOUND);

    if (!token.tokenDevice) throw new HttpException('Token is empty', HttpStatus.NOT_FOUND);

    const payload = JSON.stringify(
      new InputNotificationDto({ default: 'default', body: params.message, title: params.title, sound: 'default' }),
    );

    const params_sns = {
      Message: payload,
      TargetArn: token.tokenDevice,
      MessageStructure: 'json',
    };

    try {
      const command = new PublishCommand(params_sns);
      const response = await this.client.send(command);
      return response.MessageId;
    } catch (error) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  public async publishNotification(input: any) {
    const command = new PublishCommand(input);
    return await this.client.send(command);
  }

  public async saveToken(id: string, token: string) {
    const input = {
      PlatformApplicationArn: process.env.AWS_TOPIC_ARN,
      Token: token,
    };
    const command = new CreatePlatformEndpointCommand(input);
    const response_sns = await this.client.send(command);
    if (!response_sns.EndpointArn) throw new HttpException('AWS ERROR', HttpStatus.BAD_REQUEST);
    const response = this.notificationRepository.updateToken(id, response_sns.EndpointArn);
    if (!response) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return response;
  }
}
