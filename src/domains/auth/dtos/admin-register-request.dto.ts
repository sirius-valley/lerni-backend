import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class AdminRegisterRequestDto {
  @IsEmail()
  email: string;
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/, {
    message: 'password too weak',
  })
  password: string;
  @IsNotEmpty()
  @MaxLength(50, { message: 'name too long' })
  name: string;
  @IsNotEmpty()
  @MaxLength(50, { message: 'lastname too long' })
  lastname: string;

  constructor(email: string, password: string, name: string, lastname: string) {
    this.email = email;
    this.password = password;
    this.name = name;
    this.lastname = lastname;
  }
}
