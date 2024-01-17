import { IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/, {
    message: 'password too weak',
  })
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
