import { TriviaAnswerResponseStatus } from './trivia-answer-response.dto';

export class QuestionTriviaDto {
  constructor(
    public id: string,
    public question: string,
    public options: string[],
    public time: number,
    public questionNumber: number,
    public totalQuestionsNumber: number,
    public answers: { me: any[]; opponent: any[] },
    public status: TriviaAnswerResponseStatus,
  ) {}
}
