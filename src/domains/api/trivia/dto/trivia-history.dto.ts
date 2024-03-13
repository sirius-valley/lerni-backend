import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';

export class TriviaHistoryDto {
  id: string;
  status: 'WON' | 'LOST' | 'TIED' | 'WAIT';
  opponent: SimpleStudentDto | null;
  programName: string;
  score: number;
  createAt: Date;

  constructor(
    id: string,
    status: 'WON' | 'LOST' | 'TIED' | 'WAIT',
    programName: string,
    score: number,
    createAt: Date,
    opponent: SimpleStudentDto | null,
  ) {
    this.id = id;
    this.status = status;
    this.opponent = opponent ? opponent : null;
    this.programName = programName;
    this.score = score;
    this.createAt = createAt;
  }
}
