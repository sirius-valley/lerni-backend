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
  ],
  controllers: [AuthController, StudentController],
  providers: [],
})
export class AppModule {}
