import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { PillController } from './pill.controller';
import { PillService } from './pill.service';
import { PillRepository } from './pill.repository';
import { StudentRepository } from '../student/student.repository';
import { SpringPillModule } from '../pill-external-api/spring-pill.module';
import { StudentModule } from '../student/student.module';
import { HeadlandsAdapter } from './adapters/headlands.adapter';
import { AchievementModule } from '../achievement/achievement.module';
import { OpenAIService } from './openai.client';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../../../../config/configuration';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [PillController],
  imports: [
    SpringPillModule,
    StudentModule,
    AchievementModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [PrismaService, PillService, PillRepository, StudentRepository, HeadlandsAdapter, OpenAIService],
  exports: [PillService, PillRepository],
})
export class PillModule {}
