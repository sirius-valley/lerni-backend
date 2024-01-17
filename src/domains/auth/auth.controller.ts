import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { JwtDto } from './dtos/jwt.dto';
import { LoginRequestDto } from './dtos/login-request.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerRequestDTO: RegisterRequestDto,
  ): Promise<JwtDto> {
    return this.authService.register(registerRequestDTO);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginRequestDTO: LoginRequestDto): Promise<JwtDto> {
    return this.authService.login(loginRequestDTO);
  }
}
