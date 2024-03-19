import { TriviaQuestionDto } from './trivia-question.dto';

export enum TriviaAnswerResponseStatus {
  WON = 'Won',
  LOST = 'Lost',
  IN_PROGRESS = 'In Progress',
  WAITING = 'Waiting',
  TIED = 'Tied',
  NOT_STARTED = 'Not Started',
}

export class TriviaAnswerResponseDto {
  triviaQuestion: TriviaQuestionDto;
  isCorrect: boolean;
  status: TriviaAnswerResponseStatus;
  opponentAnswer?: { id: string; isCorrect: boolean };
  correctOption: string;

  constructor(data: any) {
    this.triviaQuestion = data.triviaQuestion;
    this.isCorrect = data.isCorrect;
    this.status = data.status;
    this.opponentAnswer = data.opponentAnswer;
    this.correctOption = data.correctOption;
  }
}
