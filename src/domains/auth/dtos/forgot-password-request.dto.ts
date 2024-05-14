import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsEmail()
  email: string;

  constructor(email: string) {
    this.email = email;
  }
}
