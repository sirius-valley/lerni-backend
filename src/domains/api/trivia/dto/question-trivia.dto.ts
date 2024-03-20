import { TriviaAnswerResponseStatus } from './trivia-answer-response.dto';
import { TriviaQuestionDto } from './trivia-question.dto';

export class QuestionTriviaDto {
  constructor(
    public question: TriviaQuestionDto,
    public questionNumber: number,
    public totalQuestionsNumber: number,
    public answers: { me: any[]; opponent: any[] },
    public status: TriviaAnswerResponseStatus,
  ) {}
}
