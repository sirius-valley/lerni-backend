import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { configuration } from '../../../config/configuration';
import * as process from 'process';
import { LoginRequestDto } from './dtos/login-request.dto';
import { MailModule } from '../../mail/mail.module';
import { MailService } from '../../mail/mail.service';

process.env.JWT_SECRET = 'test_secret_long';
describe('AuthController', () => {
  let authController: AuthController;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        MailModule,
        ConfigModule.forRoot({
          envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
          load: [configuration],
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, AuthRepository, JwtService, ConfigService, PrismaService, MailService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .overrideProvider(MailService)
      .useValue(mockDeep<MailService>())
      .compile();

    authController = app.get(AuthController);
    prismaService = app.get(PrismaService);
  });

  describe('root', () => {
    it('should return 403 when mail in use', async () => {
      prismaService.auth.findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'test@mail.com',
        password: 'Password12',
        isActive: true,
        tokenDevice: null,
        createdAt: new Date(),
      });

      await expect(authController.register(new RegisterRequestDto('test@mail.com', 'Password12'))).rejects.toThrow(
        new HttpException('Este email ya ha sido registrado', 409),
      );
    });
    it('should return token successfully when not found', async () => {
      prismaService.auth.findUnique.mockResolvedValueOnce(null);
      prismaService.auth.create.mockResolvedValueOnce({
        id: '1',
        email: 'test@mail.com',
        password: 'Password12',
      } as any);
      await expect(authController.register(new RegisterRequestDto('test@mail.com', 'Password12'))).resolves.toEqual({
        token: expect.any(String),
      });
    });
  });

  describe('login', () => {
    it('should return 404 when user is not found', async () => {
      prismaService.auth.findUnique.mockResolvedValueOnce(null);

      await expect(authController.login(new LoginRequestDto('test@mail.com', 'Password12'))).rejects.toThrow(
        new HttpException('Email no registrado', 404),
      );
    });

    it('should return token when successfully logged in', async () => {
      prismaService.auth.findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'test@mail.com',
        password: '$2b$10$g4aIAoxVYBx/CcSgUE7lue32ImLYKYIhY09djyIwKs4m1bcC/C/2i',
      } as any);
      await expect(authController.login(new LoginRequestDto('test@mail.com', 'Password12'))).resolves.toEqual({
        token: expect.any(String),
      });
    });

    it('should return 401 when entered invalid password', () => {
      prismaService.auth.findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'test@mail.com',
        password: '$2b$10$g4aIAoxVYBx/CcSgUE7lue32ImLYKYIhY09djyIwKs4m1bcC/C/2i',
      } as any);
      expect(authController.login(new LoginRequestDto('test@mail.com', 'WrongPassword'))).rejects.toThrow(
        new HttpException('Email o contraseña incorrecta', 401),
      );
    });
  });
});
