import { IsNotEmpty, IsString } from 'class-validator';

export class TriviaAnswerRequestDto {
  @IsNotEmpty()
  @IsString()
  triviaId: string;
  @IsNotEmpty()
  @IsString()
  questionId: string;
  @IsNotEmpty()
  answer: string | string[];

  constructor(triviaId: string, questionId: string, answer: string) {
    this.triviaId = triviaId;
    this.questionId = questionId;
    this.answer = answer;
  }
}
