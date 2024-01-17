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

process.env.NODE_ENV = 'development';
describe('AuthController', () => {
  let authController: AuthController;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        MailModule,
        ConfigModule.forRoot({
          envFilePath: `${process.cwd()}/config/env/${
            process.env.NODE_ENV
          }.env`,
          load: [configuration],
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        AuthRepository,
        JwtService,
        ConfigService,
        PrismaService,
        MailService,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    authController = app.get(AuthController);
    prismaService = app.get(PrismaService);
  });

  describe('root', () => {
    it('should return 403 when mail in use', () => {
      (prismaService.auth as any).findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'test@mail.com',
        password: 'Password12',
        createdAt: new Date(),
      } as any);

      expect(
        authController.register(
          new RegisterRequestDto('test@mail.com', 'Password12'),
        ),
      ).rejects.toThrow(new HttpException('Email already in use', 409));
    });
    it('should return token successfully when not found', () => {
      (prismaService.auth as any).findUnique.mockResolvedValueOnce(null);
      (prismaService.auth as any).create.mockResolvedValueOnce({
        id: 1,
        email: 'test@mail.com',
        password: 'Password12',
      } as any);
      expect(
        authController.register(
          new RegisterRequestDto('test@mail.com', 'Password12'),
        ),
      ).resolves.toEqual({ token: expect.any(String) });
    });
  });

  describe('login', () => {
    it('should return 404 when user is not found', () => {
      (prismaService.auth as any).findUnique.mockResolvedValueOnce(null);

      expect(
        authController.register(
          new RegisterRequestDto('test@mail.com', 'Password12'),
        ),
      ).rejects.toThrow(
        new HttpException('User with provided email not found', 404),
      );
    });

    it('should return token when successfully logged in', () => {
      (prismaService.auth as any).findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'test@mail.com',
        password: 'Password12',
      } as any);
      expect(
        authController.login(
          new LoginRequestDto('test@mail.com', 'Password12'),
        ),
      ).resolves.toEqual({ token: expect.any(String) });
    });

    it('should return 401 when entered invalid password', () => {
      (prismaService.auth as any).findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'test@mail.com',
        password: 'Password12',
      } as any);
      expect(
        authController.login(
          new LoginRequestDto('test@mail.com', 'Password12'),
        ),
      ).rejects.toThrow(new HttpException('Invalid credentials', 401));
    });
  });
});
