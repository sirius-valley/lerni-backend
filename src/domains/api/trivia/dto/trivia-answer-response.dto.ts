import { TriviaQuestionDto } from './trivia-question.dto';
import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';

export enum TriviaAnswerResponseStatus {
  WON = 'Won',
  LOST = 'Lost',
  IN_PROGRESS = 'In Progress',
  WAITING = 'Waiting',
  TIED = 'Tied',
  NOT_STARTED = 'Not Started',
  CHALLENGED = 'Challenged',
}

export class TriviaAnswerResponseDto {
  triviaQuestion: TriviaQuestionDto;
  isCorrect: boolean;
  status: TriviaAnswerResponseStatus;
  opponent?: SimpleStudentDto;
  opponentAnswers?: { id: string; isCorrect: boolean }[];
  correctOption: string;

  constructor(data: any) {
    this.triviaQuestion = data.triviaQuestion;
    this.isCorrect = data.isCorrect;
    this.status = data.status;
    this.opponent = data.opponent;
    this.opponentAnswers = data.opponentAnswer;
    this.correctOption = data.correctOption;
  }
}
