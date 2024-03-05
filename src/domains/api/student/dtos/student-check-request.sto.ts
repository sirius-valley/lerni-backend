import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail } from 'class-validator';

export class CheckStudent {
  @ApiProperty()
  @IsArray()
  @IsEmail()
  emails: string[];

  constructor(emails: string[]) {
    this.emails = emails;
  }
}
