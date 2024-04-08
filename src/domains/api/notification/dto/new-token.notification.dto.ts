import { IsNotEmpty, IsString } from 'class-validator';

export class NewTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
