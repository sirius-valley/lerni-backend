import { IsNotEmpty } from 'class-validator';

export class QuestionnaireAnswerRequestDto {
  @IsNotEmpty()
  questionnaireId: string;
  @IsNotEmpty()
  questionId: string;
  @IsNotEmpty()
  answer: string | string[];

  constructor(questionnaireId: string, questionId: string, answer: string) {
    this.questionnaireId = questionnaireId;
    this.questionId = questionId;
    this.answer = answer;
  }
}
