import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CheckStudent {
  @ApiProperty()
  @IsEmail()
  email: string;

  constructor(email: string) {
    this.email = email;
  }
}
