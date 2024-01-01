import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../../prisma.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../../../config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, AuthRepository, PrismaService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
