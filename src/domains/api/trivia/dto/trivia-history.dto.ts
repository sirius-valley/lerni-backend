import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';
import { TriviaStatus } from './trivia-interfaces.interface';

export class TriviaHistoryDto {
  id: string;
  status: TriviaStatus;
  opponent: SimpleStudentDto | null;
  programName: string;
  score: any;
  createAt: Date;

  constructor(id: string, status: TriviaStatus, programName: string, score: any, createAt: Date, opponent: SimpleStudentDto | null) {
    this.id = id;
    this.status = status;
    this.opponent = opponent ? opponent : null;
    this.programName = programName;
    this.score = score;
    this.createAt = createAt;
  }
}
