export class TriviaQuestionDto {
  id: string;
  question: string;
  secondsToAnswer: number;
  options: string[];

  constructor(id: string, question: string, secondsToAnswer: number, options: string[]) {
    this.id = id;
    this.question = question;
    this.secondsToAnswer = secondsToAnswer;
    this.options = options;
  }
}
