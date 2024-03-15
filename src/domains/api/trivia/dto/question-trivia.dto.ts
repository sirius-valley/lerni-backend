import { QuestionTriviaStatus } from './question-trivia-status.enum';

export class QuestionTriviaDto {
  constructor(
    public question: string,
    public options: string[],
    public time: number,
    public questionNumber: number,
    public totalQuestionsNumber: number,
    public answers: { me: any[]; opponent: any[] },
    public status: QuestionTriviaStatus,
  ) {}
}
