import { IsNotEmpty } from 'class-validator';

export class AnswerRequestDto {
  @IsNotEmpty()
  pillId: string;
  @IsNotEmpty()
  questionId: string;
  @IsNotEmpty()
  answer: string;

  constructor(pillId: string, questionId: string, answer: string) {
    this.pillId = pillId;
    this.questionId = questionId;
    this.answer = answer;
  }
}
