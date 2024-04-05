import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';
import { TriviaAnswerResponseStatus } from './trivia-answer-response.dto';

export class TriviaHistoryDto {
  id: string;
  status: TriviaAnswerResponseStatus;
  opponent: SimpleStudentDto | null;
  programName: string;
  score: number;
  createAt?: Date;

  constructor(
    id: string,
    status: TriviaAnswerResponseStatus,
    programName: string,
    score: number,
    opponent: SimpleStudentDto | null,
    createAt?: Date,
  ) {
    this.id = id;
    this.status = status;
    this.opponent = opponent ? opponent : null;
    this.programName = programName;
    this.score = score;
    this.createAt = createAt;
  }
}
