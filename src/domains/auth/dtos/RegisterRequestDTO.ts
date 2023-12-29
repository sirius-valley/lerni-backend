import { IsEmail, Matches } from 'class-validator';

export class RegisterRequestDTO {
  @IsEmail()
  email: string;

  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/, {
    message: 'password too weak',
  })
  password: string;
}
