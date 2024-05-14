export class PillAnswerSpringDto {
  questionId: string;
  value: any;

  constructor(questionId: string, value: any) {
    this.questionId = questionId;
    this.value = value;
  }
}
