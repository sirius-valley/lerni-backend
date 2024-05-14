import { IsNotEmpty, IsString } from 'class-validator';

export class NotificationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  title: string;
}
