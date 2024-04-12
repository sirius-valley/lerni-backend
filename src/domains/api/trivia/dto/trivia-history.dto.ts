import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';
import { TriviaAnswerResponseStatus } from './trivia-answer-response.dto';

export class TriviaHistoryDto {
  id: string;
  status: TriviaAnswerResponseStatus;
  opponent: SimpleStudentDto | null;
  programName: string;
  score: number;
  opponentScore: number;
  createAt?: Date;
  finishedDateTime?: Date | null;

  constructor(
    id: string,
    status: TriviaAnswerResponseStatus,
    programName: string,
    score: number,
    opponentScore: number,
    opponent: SimpleStudentDto | null,
    createAt?: Date,
    finishedDateTime?: Date | null,
  ) {
    this.id = id;
    this.status = status;
    this.opponent = opponent ? opponent : null;
    this.programName = programName;
    this.score = score;
    this.opponentScore = opponentScore;
    this.createAt = createAt;
    this.finishedDateTime = finishedDateTime;
  }
}
