export enum TriviaAnswerStatus {
  CORRECT = 'CORRECT',
  INCORRECT = 'INCORRECT',
  UNANSWERED = 'UNANSWERED',
  TIMEDOUT = 'TIMEDOUT',
  LEFT = 'LEFT',
}

export class TriviaQuestionDetailsDto {
  questionId: string;
  question: string;
  correctOption: string;
  selectedOption?: string;
  opponentAnswer?: string;
  userAnswerStatus: TriviaAnswerStatus;
  opponentAnswerStatus: TriviaAnswerStatus;
}
