import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDTO } from './dtos/RegisterRequestDTO';
import { JWTDTO } from './dtos/JWTDTO';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerRequestDTO: RegisterRequestDTO,
  ): Promise<JWTDTO> {
    return this.authService.register(registerRequestDTO);
  }
}
