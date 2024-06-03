export class SimpleQuestionnaireProgressDto {
  name: string;
  progress: number;
  attempts: number;
  questionCount: number;
  correctAnswers: number;

  constructor(data: any) {
    this.name = data.name;
    this.progress = data.progress;
    this.attempts = data.attempts;
    this.questionCount = data.questionCount;
    this.correctAnswers = data.correctAnswers;
  }
}
