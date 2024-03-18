import { TriviaQuestionDto } from './trivia-question.dto';

export enum TriviaAnswerResponseStatus {
  WON = 'Won',
  LOST = 'Lost',
  IN_PROGRESS = 'In Progress',
  WAITING = 'Waiting',
  TIED = 'Tied',
}

export class TriviaAnswerResponseDto {
  triviaQuestion: TriviaQuestionDto;
  isCorrect: boolean;
  status: TriviaAnswerResponseStatus;
  opponentAnsweredCorrectly?: boolean;
  correctOption: string;
}
