import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public async sendMail(email: string) {
    await this.mailerService.sendMail({
      to: email,
      from: `Lerni Team ${this.configService.get<string>('EMAIL_USER')}`,
      subject: 'Bienvenido/a a Lerni',
      template: 'welcome',
    });
  }

  public async sendPasswordRecoveryEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      from: `Lerni Team ${this.configService.get<string>('EMAIL_USER')}`,
      subject: 'Lerni - Recuperar Contraseña',
      template: 'password-recovery',
      context: {
        recoveryCode: code,
      },
    });
  }
}
