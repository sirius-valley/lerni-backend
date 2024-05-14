import { IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
