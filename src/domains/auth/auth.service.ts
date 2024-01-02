import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterRequestDTO } from './dtos/RegisterRequestDTO';
import { JWTDTO } from './dtos/JWTDTO';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginRequestDTO } from './dtos/LoginRequestDTO';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(registerDTO: RegisterRequestDTO): Promise<JWTDTO> {
    const auth = await this.authRepository.findAuthByEmail(registerDTO.email);
    if (auth)
      throw new HttpException('Email already in use', HttpStatus.CONFLICT);
    const hashedPassword = await this.hashPassword(registerDTO.password);
    const authCreated = await this.authRepository.createAuth({
      ...registerDTO,
      password: hashedPassword,
    });
    const jwt = await this.jwtService.signAsync(
      { sub: authCreated.id },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
    return new JWTDTO(jwt);
  }

  public async login(loginDTO: LoginRequestDTO): Promise<JWTDTO> {
    const auth = await this.authRepository.findAuthByEmail(loginDTO.email);
    if (!auth)
      throw new HttpException(
        'User with provided email not found',
        HttpStatus.NOT_FOUND,
      );
    const isCorrectPassword = await this.comparePassword(
      loginDTO.password,
      auth.password,
    );
    if (!isCorrectPassword)
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    const jwt = await this.jwtService.signAsync(
      { sub: auth.id },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
    return new JWTDTO(jwt);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
