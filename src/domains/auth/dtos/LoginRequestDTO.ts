import { IsNotEmpty } from 'class-validator';

export class LoginRequestDTO {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
