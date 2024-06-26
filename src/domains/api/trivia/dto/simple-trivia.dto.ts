import { SimpleProgramDto } from '../../program/dtos/simple-program.dto';
import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';

export class SimpleTriviaDto {
  triviaId: string;
  triviaMatchId: string;
  program: SimpleProgramDto;
  opponent?: SimpleStudentDto;

  constructor(triviaId: string, triviaMatchId: string, program: SimpleProgramDto, opponent?: SimpleStudentDto) {
    this.triviaId = triviaId;
    this.triviaMatchId = triviaMatchId;
    this.program = program;
    this.opponent = opponent;
  }
}
