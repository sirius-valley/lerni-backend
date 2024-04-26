import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '../domains/auth/auth.controller';
import { AuthModule } from '../domains/auth/auth.module';
import { configuration } from '../../config/configuration';
import { StudentModule } from '../domains/api/student/student.module';
import { StudentController } from '../domains/api/student/student.controller';
import { PillModule } from '../domains/api/pill/pill.module';
import { ProgramModule } from '../domains/api/program/program.module';
import { QuestionnaireModule } from '../domains/api/questionnaire/questionnaire.module';
import { SearchModule } from 'src/domains/api/search/search.module';
import { ProfessorModule } from 'src/domains/api/professor/professor.module';
import { TriviaModule } from '../domains/api/trivia/trivia.module';
import { NotificationModule } from 'src/domains/api/notification/notification.module';
import { AchievementModule } from '../domains/api/achievement/achievement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
    AuthModule,
    StudentModule,
    PillModule,
    ProgramModule,
    QuestionnaireModule,
    SearchModule,
    ProfessorModule,
    TriviaModule,
    NotificationModule,
    AchievementModule,
  ],
  controllers: [AuthController, StudentController],
  providers: [],
})
export class AppModule {}
