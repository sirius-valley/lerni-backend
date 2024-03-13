import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StudentDto } from '../student/dtos/student.dto';
import { TriviaRepository } from './trivia.repository';
import { ProgramService } from '../program/program.service';
import { SimpleTriviaDto } from './dto/simple-trivia.dto';
import { SimpleProgramDto } from '../program/dtos/simple-program.dto';
import { SimpleStudentDto } from '../student/dtos/simple-student.dto';
import { StudentService } from '../student/student.service';
import { TriviaHistoryDto } from './dto/trivia-history.dto';

@Injectable()
export class TriviaService {
  constructor(
    private readonly triviaRepository: TriviaRepository,
    private readonly programService: ProgramService,
    private readonly studentService: StudentService,
  ) {}

  public async createOrAssignTriviaMatch(student: StudentDto, programId: string) {
    // check if student is already enrolled in the program
    const programVersion = await this.programService.getProgramVersion(student.id, programId);
    // check if student has already started a trivia match
    if (await this.triviaRepository.getTriviaMatchByStudentIdAndProgramVersionId(student.id, programVersion.id))
      throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    // check if there is a trivia match available
    const triviaMatch = await this.triviaRepository.findTriviaMatchByProgramVersionId(programVersion.id);
    if (triviaMatch) {
      await this.assignMatchToStudent(student.id, triviaMatch.id);
      return new SimpleTriviaDto(
        triviaMatch.triviaId,
        new SimpleProgramDto(programVersion.program, 100),
        triviaMatch.studentTriviaMatches[0].student,
      );
    }

    // create new trivia match
    const createdMatch = await this.createTriviaMatch(student.id, programVersion.id);

    // find an opponent
    const opponent = await this.findOpponent(programVersion.id, createdMatch.triviaId);
    if (opponent) await this.assignMatchToStudent(opponent.id, createdMatch.id);

    return new SimpleTriviaDto(
      createdMatch.triviaId,
      new SimpleProgramDto(programVersion.program, 100),
      opponent ? new SimpleStudentDto(opponent) : undefined,
    );
  }

  private async assignMatchToStudent(studentId: string, triviaMatchId: string) {
    // TODO: notify other student
    return await this.triviaRepository.createStudentTriviaMatch(studentId, triviaMatchId);
  }

  private async createTriviaMatch(studentId: string, programVersionId: string) {
    const trivia = await this.triviaRepository.findTriviaByProgramVersionId(programVersionId);
    if (!trivia) throw new HttpException('Trivia not found', HttpStatus.NOT_FOUND);
    return await this.triviaRepository.createTriviaMatch(studentId, trivia.id);
  }

  private async findOpponent(programVersionId: string, triviaId: string) {
    //find students who are enrolled and don't have a trivia match
    const students = await this.triviaRepository.getStudentsByProgramVersionIdAndNoTriviaMatch(programVersionId, triviaId);
    //find the first one that has completed the program
    return students.find(async (student) => await this.triviaRepository.getStudentWithCompleteProgram(student.id, programVersionId));
  }

  public async getTriviaHistory(student: StudentDto, page: number): Promise<any> {
    const options = { limit: Number(10), offset: (page - 1) * 10 };
    const { results, total } = await this.triviaRepository.getTriviaHistory(student.id, options);

    const data = results.map(async (item) => {
      const program = await this.getProgramByTriviaMatchId(item.triviaMatchId);
      const otherMatches = await this.triviaRepository.getStudentTriviaMatchNotIdStudent(item.triviaMatchId, item.studentId);
      if (otherMatches) {
        const oponent = await this.studentService.getStudentById(otherMatches.studentId);
        const result = await this.getTriviaResult(item.studentId, otherMatches.studentId);
        return new TriviaHistoryDto(item.id, result, program.name, 10, oponent);
      }
      return new TriviaHistoryDto(item.id, 'WAIT', program.name, 10, null);
    });

    return { results: data, totalPages: Math.ceil(total / 10) };
  }

  private async getProgramByTriviaMatchId(triviaMatchId: string) {
    const triviaMatch = await this.triviaRepository.getTriviaMatchById(triviaMatchId);
    if (!triviaMatch) throw 'error';
    const trivia = await this.triviaRepository.getTriviaById(triviaMatch?.triviaId);
    if (!trivia) throw 'error';
    const triviaVersion = await this.triviaRepository.getProgramTriviaVersionByTriviaId(trivia.id);
    if (!triviaVersion) throw 'error';
    const program = await this.programService.getProgramByProgramVersionId(triviaVersion?.programVersionId);
    if (!program) throw 'error';
    return program;
  }

  private async getTriviaResult(studentId: string, oponentId: string) {
    const otherAnswer = await this.triviaRepository.getTriviaAnswerCorrectCountByMatchId(oponentId);
    const myAnswer = await this.triviaRepository.getTriviaAnswerCorrectCountByMatchId(studentId);
    return otherAnswer > myAnswer ? 'LOST' : otherAnswer < myAnswer ? 'WON' : 'TIED';
  }
}
