import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';
import { SimplePillDto } from './simple-pill.dto';
import { TriviaProgressDto } from '../../trivia/dto/trivia-progress.dto';
import { SimpleQuestionnaireProgressDto } from '../../questionnaire/dtos/simple-questionnaire-progress.dto';
import { ProgramListDto } from './program-list.dto';

export class StudentProgressDto {
  student: SimpleStudentDto;
  program: ProgramListDto;
  pills: SimplePillDto[];
  questionnaire: SimpleQuestionnaireProgressDto;
  trivia: TriviaProgressDto;

  constructor(data: any) {
    this.student = data.student;
    this.program = data.program;
    this.pills = data.pills;
    this.questionnaire = data.questionnaire;
    this.trivia = data.trivia;
  }
}
