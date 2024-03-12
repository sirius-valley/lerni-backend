import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StudentDto } from '../student/dtos/student.dto';
import { TriviaRepository } from './trivia.repository';
import { ProgramRepository } from '../program/program.repository';

@Injectable()
export class TriviaService {
  constructor(
    private readonly triviaRepository: TriviaRepository,
    private readonly programRepository: ProgramRepository,
  ) {}

  public async createTrivia(student: StudentDto, programId: string) {
    // check if student is already enrolled in the program
    if (!(await this.isStudentEnrolled(student.id, programId))) throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    // check if student has already started a trivia match
    if (await this.triviaRepository.getTriviaMatchByStudentIdAndProgramId(student.id, programId))
      throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    // check if there is a trivia match available
    const triviaMatch = await this.triviaRepository.findTriviaMatchByProgramId(programId);
    if (triviaMatch) return this.assignMatchToStudent(student.id, triviaMatch.id);
  }

  private async isStudentEnrolled(studentId: string, programId: string) {
    // check if student is already enrolled in the program
    const studentProgram = await this.programRepository.getStudentProgramByStudentIdAndProgramId(studentId, programId);
    return !!studentProgram;
  }

  private async assignMatchToStudent(studentId: string, triviaMatchId: string) {
    // TODO: notify other student
    return await this.triviaRepository.createStudentTriviaMatch(studentId, triviaMatchId);
  }
}
