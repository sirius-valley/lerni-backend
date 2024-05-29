import { TriviaAnswerResponseStatus } from './trivia-answer-response.dto';

export class TriviaProgressDto {
  status: TriviaAnswerResponseStatus;
  correctAnswers: number;
  totalQuestions: number;

  constructor(data: any) {
    this.status = data.status;
    this.correctAnswers = data.correctAnswers;
    this.totalQuestions = data.totalQuestions;
  }
}
