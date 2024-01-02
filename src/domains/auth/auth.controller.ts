import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDTO } from './dtos/RegisterRequestDTO';
import { JWTDTO } from './dtos/JWTDTO';
import { LoginRequestDTO } from './dtos/LoginRequestDTO';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerRequestDTO: RegisterRequestDTO,
  ): Promise<JWTDTO> {
    return this.authService.register(registerRequestDTO);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginRequestDTO: LoginRequestDTO): Promise<JWTDTO> {
    return this.authService.login(loginRequestDTO);
  }
}
