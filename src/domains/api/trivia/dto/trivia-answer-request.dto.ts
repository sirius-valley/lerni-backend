import { IsNotEmpty, IsString } from 'class-validator';

export class TriviaAnswerRequestDto {
  @IsNotEmpty()
  @IsString()
  triviaMatchId: string;
  @IsNotEmpty()
  @IsString()
  questionId: string;
  @IsNotEmpty()
  answer: string | string[];

  constructor(triviaMatchId: string, questionId: string, answer: string) {
    this.triviaMatchId = triviaMatchId;
    this.questionId = questionId;
    this.answer = answer;
  }
}
