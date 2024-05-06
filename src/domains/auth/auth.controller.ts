import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { JwtDto } from './dtos/jwt.dto';
import { LoginRequestDto } from './dtos/login-request.dto';
import { ApiTags } from '@nestjs/swagger';
import { AdminRegisterRequestDto } from './dtos/admin-register-request.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerRequestDTO: RegisterRequestDto): Promise<JwtDto> {
    return this.authService.register(registerRequestDTO);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginRequestDTO: LoginRequestDto): Promise<JwtDto> {
    return this.authService.login(loginRequestDTO);
  }

  @Post('/admin/register')
  async registerAdmin(@Body() adminRegisterRequestDTO: AdminRegisterRequestDto): Promise<JwtDto> {
    return this.authService.registerAdmin(adminRegisterRequestDTO);
  }

  @Post('/admin/login')
  @HttpCode(200)
  async loginAdmin(@Body() adminLoginRequestDTO: LoginRequestDto): Promise<JwtDto> {
    return this.authService.loginAdmin(adminLoginRequestDTO);
  }

  @Post('/forgotPassword')
  @HttpCode(200)
  async forgotPassword(@Body() email: string) {
    return this.authService.temporalCode(email);
  }

  @Post('/forgotPassword/code')
  @HttpCode(200)
  async forgotPasswordCode(@Body() data: { code: string; email: string }) {
    return this.authService.validateCode(data.code, data.email);
  }

  @Post('/forgotPassword/newPassword')
  async forgotPasswordNewPassword(@Body() data: { email: string; newPassword: string }) {
    return this.authService.updatePassword(data.email, data.newPassword);
  }
}
