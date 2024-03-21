import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';
import { TriviaQuestionDetailsDto } from './trivia-question-details.dto';
import { TriviaStatus } from './trivia-interfaces.interface';

export class TriviaDetailsDto {
  triviaMatchId: string;
  opponent?: SimpleStudentDto;
  programName: string;
  finishedDateTime: Date;
  triviaStatus: TriviaStatus;
  questions: TriviaQuestionDetailsDto[];

  constructor(data: any) {
    this.triviaMatchId = data.triviaMatchId;
    this.opponent = data.opponent;
    this.programName = data.programName;
    this.finishedDateTime = data.finishedDateTime;
    this.triviaStatus = data.triviaStatus;
    this.questions = data.questions;
  }
}
