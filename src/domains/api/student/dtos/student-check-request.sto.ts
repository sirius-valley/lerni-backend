import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty } from 'class-validator';

export class CheckStudent {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  constructor(emails: string[]) {
    this.emails = emails;
  }
}
