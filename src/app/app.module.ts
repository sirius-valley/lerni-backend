import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '../domains/auth/auth.controller';
import { AuthModule } from '../domains/auth/auth.module';
import { configuration } from '../../config/configuration';
import { StudentModule } from '../domains/api/student/student.module';
import { StudentController } from '../domains/api/student/student.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
    AuthModule,
    StudentModule,
  ],
  controllers: [AuthController, StudentController],
  providers: [],
})
export class AppModule {}
