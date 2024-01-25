import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { JwtDto } from './dtos/jwt.dto';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginRequestDto } from './dtos/login-request.dto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  public async register(registerDTO: RegisterRequestDto): Promise<JwtDto> {
    const auth = await this.authRepository.findAuthByEmail(registerDTO.email);
    if (auth) throw new HttpException('Email already in use', HttpStatus.CONFLICT);
    const hashedPassword = await this.hashPassword(registerDTO.password);
    const authCreated = await this.authRepository.createAuthAndStudent({
      ...registerDTO,
      password: hashedPassword,
    });
    const jwt = await this.jwtService.signAsync({ sub: authCreated.id }, { secret: this.configService.get<string>('JWT_SECRET') });
    await this.mailService.sendMail(authCreated.email);
    return new JwtDto(jwt);
  }

  public async login(loginDTO: LoginRequestDto): Promise<JwtDto> {
    const auth = await this.authRepository.findAuthByEmail(loginDTO.email);
    if (!auth) throw new HttpException('User with provided email not found', HttpStatus.NOT_FOUND);
    const isCorrectPassword = await this.comparePassword(loginDTO.password, auth.password);
    if (!isCorrectPassword) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    const jwt = await this.jwtService.signAsync({ sub: auth.id }, { secret: this.configService.get<string>('JWT_SECRET') });
    return new JwtDto(jwt);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
