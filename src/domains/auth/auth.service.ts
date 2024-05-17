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
import { ForgotPasswordRequestDto } from './dtos/forgot-password-request.dto';
import { maxResetCodesPerHour, maxResetTokenAttemptsPerCode } from '../../const';
import { PasswordCodeRequestDto } from './dtos/password-code-request.dto';

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
        throw new HttpException('Este email ya ha sido registrado', HttpStatus.CONFLICT);
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
    if (!auth) throw new HttpException('Email no registrado', HttpStatus.NOT_FOUND);
    const isCorrectPassword = await this.comparePassword(loginDTO.password, auth.password);
    if (!isCorrectPassword) throw new HttpException('Email o contraseña incorrecta', HttpStatus.UNAUTHORIZED);
    const jwt = await this.jwtService.signAsync({ sub: auth.id }, { secret: this.configService.get<string>('JWT_SECRET') });
    return new JwtDto(jwt);
  }

  public async registerAdmin(adminRegisterDto: AdminRegisterRequestDto) {
    const admin = await this.authRepository.findTeacherByEmail(adminRegisterDto.email);
    if (admin) throw new HttpException('Este email ya ha sido registrado', HttpStatus.CONFLICT);
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
    if (!admin) throw new HttpException('Email no registrado', HttpStatus.NOT_FOUND);
    const isCorrectPassword = await this.comparePassword(adminLoginDto.password, admin?.password);
    if (!isCorrectPassword) throw new HttpException('Email o contraseña incorrecta', HttpStatus.UNAUTHORIZED);
    const jwt = await this.jwtService.signAsync(
      {
        sub: admin.id,
        role: 'admin',
      },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
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

  public async temporalCode(data: ForgotPasswordRequestDto) {
    const user = await this.authRepository.findAuthByEmail(data.email);
    if (!user) return HttpStatus.ACCEPTED;
    const latestCodes = await this.authRepository.getLastHourResetTokens(user.id);
    if (latestCodes.length > maxResetCodesPerHour) throw new HttpException('Reset password request exceeded', HttpStatus.FORBIDDEN);

    const token = this.generateResetCode();
    const hashedToken = await this.hashPassword(token);

    //create code
    await this.authRepository.createResetPasswordToken(hashedToken, user.id);

    //sendEmail
    this.mailService.sendPasswordRecoveryEmail(data.email, token);

    return HttpStatus.ACCEPTED;
  }

  private generateResetCode() {
    let code = '';

    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

  public async validateCode(data: PasswordCodeRequestDto) {
    const user = await this.authRepository.findAuthByEmail(data.email);
    if (!user) throw new HttpException('Código inválido', HttpStatus.FORBIDDEN);
    const latestToken = await this.authRepository.getLatestResetPasswordToken(user.id);
    if (!latestToken) throw new HttpException('Código inválido', HttpStatus.FORBIDDEN);

    // check if passed attempt maximum
    if (latestToken.attemptCount >= maxResetTokenAttemptsPerCode)
      throw new HttpException('Cantidad máxima de intentos excedida', HttpStatus.FORBIDDEN);

    if (await this.comparePassword(data.code, latestToken.token)) {
      await this.authRepository.updateResetPasswordTokenData(latestToken.id, { validatedDate: new Date() });
      return HttpStatus.ACCEPTED;
    } else {
      const attemptCount = latestToken.attemptCount;
      await this.authRepository.updateResetPasswordTokenData(latestToken.id, { attemptCount: attemptCount + 1 });
      throw new HttpException('Código invalido', HttpStatus.FORBIDDEN);
    }
  }

  public async updatePassword(email: string, newPassword: string) {
    const user = await this.authRepository.findAuthByEmail(email);
    if (!user) throw new HttpException('Solicitud inválida', HttpStatus.FORBIDDEN);
    const lastResetToken = await this.authRepository.getLatestResetPasswordToken(user.id);
    if (!lastResetToken || !lastResetToken.validatedDate) throw new HttpException('Solicitud inválida', HttpStatus.FORBIDDEN);
    const hashedPassword = await this.hashPassword(newPassword);
    await this.authRepository.updateIsActive({ ...user, password: hashedPassword });
    await this.authRepository.deleteResetPasswordTokensByAuthId(user.id);
    return HttpStatus.ACCEPTED;
  }
}
