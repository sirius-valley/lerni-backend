import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PasswordCodeRequestDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsEmail()
  email: string;

  constructor(code: string, email: string) {
    this.code = code;
    this.email = email;
  }
}
