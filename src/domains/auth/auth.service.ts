import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { JwtDto } from './dtos/jwt.dto';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginRequestDto } from './dtos/login-request.dto';
import { MailService } from '../../mail/mail.service';
import { AdminRegisterRequestDto } from './dtos/admin-register-request.dto';

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
    if (auth) {
      if (auth.isActive) {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT);
      } else {
        const hashedPassword = await this.hashPassword(registerDTO.password);
        const authCreated = await this.authRepository.updateIsActive({ ...registerDTO, password: hashedPassword });
        const jwt = await this.jwtService.signAsync({ sub: authCreated.id }, { secret: this.configService.get<string>('JWT_SECRET') });
        await this.mailService.sendMail(authCreated.email);
        return new JwtDto(jwt);
      }
    } else {
      const hashedPassword = await this.hashPassword(registerDTO.password);
      const authCreated = await this.authRepository.createAuthAndStudent({
        ...registerDTO,
        password: hashedPassword,
      });
      const jwt = await this.jwtService.signAsync({ sub: authCreated.id }, { secret: this.configService.get<string>('JWT_SECRET') });
      await this.mailService.sendMail(authCreated.email);
      return new JwtDto(jwt);
    }
  }

  public async login(loginDTO: LoginRequestDto): Promise<JwtDto> {
    const auth = await this.authRepository.findAuthByEmail(loginDTO.email);
    if (!auth) throw new HttpException('User with provided email not found', HttpStatus.NOT_FOUND);
    const isCorrectPassword = await this.comparePassword(loginDTO.password, auth.password);
    if (!isCorrectPassword) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    const jwt = await this.jwtService.signAsync({ sub: auth.id }, { secret: this.configService.get<string>('JWT_SECRET') });
    return new JwtDto(jwt);
  }

  public async registerAdmin(adminRegisterDto: AdminRegisterRequestDto) {
    const admin = await this.authRepository.findTeacherByEmail(adminRegisterDto.email);
    if (admin) throw new HttpException('Email already in use', HttpStatus.CONFLICT);
    const hashedPassword = await this.hashPassword(adminRegisterDto.password);
    const adminCreated = await this.authRepository.createTeacher({
      ...adminRegisterDto,
      password: hashedPassword,
    });
    const jwt = await this.jwtService.signAsync(
      { sub: adminCreated.id, role: 'admin' },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
    return new JwtDto(jwt);
  }

  public async loginAdmin(adminLoginDto: LoginRequestDto) {
    const admin = await this.authRepository.findTeacherByEmail(adminLoginDto.email);
    if (!admin) throw new HttpException('User with provided email not found', HttpStatus.NOT_FOUND);
    const isCorrectPassword = await this.comparePassword(adminLoginDto.password, admin?.password);
    if (!isCorrectPassword) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    const jwt = await this.jwtService.signAsync({ sub: admin.id, role: 'admin' }, { secret: this.configService.get<string>('JWT_SECRET') });
    return new JwtDto(jwt);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  private async comparePassword(password: string, hash: string | null): Promise<boolean> {
    if (!hash) return false;
    return await bcrypt.compare(password, hash);
  }

  public async temporalRegister(email: string) {
    const auth = await this.authRepository.findAuthByEmail(email);
    if (auth) {
      return auth;
    }
    const authCreated = await this.authRepository.createTemporalAuth(email);
    await this.mailService.sendMail(authCreated.email);
    return authCreated;
  }

  public async temporalCode(email: string) {
    const user = await this.authRepository.findAuthByEmail(email);
    if (!user) return HttpStatus.ACCEPTED;

    // const codigo = '';

    // for (let i = 0; i < 6; i++) {
    //   codigo += Math.floor(Math.random() * 10);
    // }

    //update code

    //sendEmail

    return HttpStatus.ACCEPTED;
  }

  public async validateCode(code: string, email: string) {
    const user = await this.authRepository.findAuthByEmail(email);
    if (!user) return HttpStatus.ACCEPTED;

    if (code === user.tokenDevice) {
      return HttpStatus.ACCEPTED;
    }
  }

  public async updatePassword(email: string, newPassword: string) {
    const user = await this.authRepository.findAuthByEmail(email);
    if (!user) return HttpStatus.ACCEPTED;
    const hashedPassword = await this.hashPassword(newPassword);
    const authCreated = await this.authRepository.updateIsActive({ ...user, password: hashedPassword });
    const jwt = await this.jwtService.signAsync({ sub: authCreated.id }, { secret: this.configService.get<string>('JWT_SECRET') });
    return new JwtDto(jwt);
  }
}
