import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StudentDto } from '../student/dtos/student.dto';
import { TriviaRepository } from './trivia.repository';
import { ProgramService } from '../program/program.service';
import { SimpleTriviaDto } from './dto/simple-trivia.dto';
import { SimpleProgramDto } from '../program/dtos/simple-program.dto';
import { SimpleStudentDto } from '../student/dtos/simple-student.dto';
import { TriviaAnswerRequestDto } from './dto/trivia-answer-request.dto';
import { StudentTriviaMatch, Trivia, TriviaAnswer } from '@prisma/client';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { PillAnswerSpringDto } from '../pill-external-api/dtos/pill-answer-spring.dto';
import { TriviaAnswerResponseStatus } from './dto/trivia-answer-response.dto';
import { TriviaQuestionDto } from './dto/trivia-question.dto';

@Injectable()
export class TriviaService {
  constructor(
    private readonly triviaRepository: TriviaRepository,
    private readonly programService: ProgramService,
    private readonly springPillService: SpringPillService,
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

  public async answerTrivia(student: StudentDto, triviaAnswer: TriviaAnswerRequestDto, authorization: string) {
    const studentTriviaMatch = await this.triviaRepository.getStudentTriviaMatchByStudentIdAndTriviaId(student.id, triviaAnswer.triviaId);
    if (!studentTriviaMatch) throw new HttpException('Trivia match not found', HttpStatus.NOT_FOUND);
    if (this.isAlreadyAnsweredQuestion(studentTriviaMatch.triviaAnswers, triviaAnswer.questionId))
      throw new HttpException('Question already answered', HttpStatus.BAD_REQUEST);

    const springResponse = await this.getSpringResponse(authorization, studentTriviaMatch.triviaMatch, triviaAnswer);

    const updatedStudentTriviaMatch = await this.triviaRepository.createTriviaAnswer(
      studentTriviaMatch.id,
      triviaAnswer.questionId,
      triviaAnswer.answer,
      springResponse.isCorrect,
    );

    const opponent = await this.triviaRepository.getTriviaOpponent(studentTriviaMatch.triviaMatchId, student.id);
    const triviaStatus = this.getMatchStatus(updatedStudentTriviaMatch, studentTriviaMatch.triviaMatch.trivia, opponent);
    if (triviaStatus !== TriviaAnswerResponseStatus.IN_PROGRESS) {
      await this.updateTriviaMatch(updatedStudentTriviaMatch, triviaStatus);
    }

    return this.getTriviaAnswerResponse(
      JSON.parse(studentTriviaMatch.triviaMatch.trivia.block),
      triviaAnswer.questionId,
      springResponse,
      triviaStatus,
      opponent,
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
    // Find students who are enrolled and don't have a trivia match
    const students = await this.triviaRepository.getStudentsByProgramVersionIdAndNoTriviaMatch(programVersionId, triviaId);
    if (students.length === 0) return undefined;

    for (const student of students) {
      const hasCompletedProgram = await this.triviaRepository.getStudentWithCompleteProgram(student.id, programVersionId);
      if (hasCompletedProgram) {
        // If the student has completed the program, return the student object
        // TODO: notify student
        return student;
      }
    }
    // If no student has completed the program, return undefined
    return undefined;
  }

  private isAlreadyAnsweredQuestion(triviaAnswers: TriviaAnswer[], questionId: string) {
    return triviaAnswers.some((answer) => answer.questionId === questionId);
  }

  private async getSpringResponse(authorization: string, triviaMatch: any, answerRequest: TriviaAnswerRequestDto) {
    const block = JSON.parse(triviaMatch.trivia.block);
    block.seed = triviaMatch.seed;
    console.log(block);
    return this.springPillService.answerQuestionnaire(
      authorization,
      block,
      new PillAnswerSpringDto(answerRequest.questionId, answerRequest.answer),
    );
  }

  private getMatchStatus(studentTriviaMatch: any, trivia: Trivia, opponentTriviaMatch?: any) {
    if (!opponentTriviaMatch) {
      if (studentTriviaMatch.triviaAnswers.length === trivia.questionCount) return TriviaAnswerResponseStatus.WAITING;
      return TriviaAnswerResponseStatus.IN_PROGRESS;
    } else return this.calcualteMatchResult(studentTriviaMatch.triviaAnswers, opponentTriviaMatch.triviaAnswers, trivia.questionCount);
  }

  private calcualteMatchResult(studentAnswers: TriviaAnswer[], opponentAnswers: TriviaAnswer[], questionCount: number) {
    const studentCorrectAnswers = studentAnswers.filter((answer) => answer.isCorrect).length;
    const opponentCorrectAnswers = opponentAnswers.filter((answer) => answer.isCorrect).length;
    const studentsQuestionsLeft = questionCount - studentAnswers.length;
    const opponentsQuestionsLeft = questionCount - opponentAnswers.length;
    if (studentCorrectAnswers > opponentCorrectAnswers + opponentsQuestionsLeft) return TriviaAnswerResponseStatus.WON;
    if (studentCorrectAnswers + studentsQuestionsLeft < opponentCorrectAnswers) return TriviaAnswerResponseStatus.LOST;
    if (studentCorrectAnswers === opponentCorrectAnswers && studentsQuestionsLeft === 0 && opponentsQuestionsLeft === 0)
      return TriviaAnswerResponseStatus.TIED;
    if (studentAnswers.length === questionCount) return TriviaAnswerResponseStatus.WAITING;
    return TriviaAnswerResponseStatus.IN_PROGRESS;
  }

  private async updateTriviaMatch(studentTriviaMatch: StudentTriviaMatch, status: TriviaAnswerResponseStatus) {
    await this.triviaRepository.setStudentTrivaMatchFinishedDateTime(studentTriviaMatch.id);
    if (status !== TriviaAnswerResponseStatus.WAITING) {
      await this.triviaRepository.setTriviaMatchFinishedDateTime(studentTriviaMatch.triviaMatchId);
    }
  }

  private async getTriviaAnswerResponse(
    triviaBlock: any,
    questionId: string,
    springResponse: any,
    status: TriviaAnswerResponseStatus,
    opponent?: any,
  ) {
    const opponentAnsweredCorrectly = opponent ? opponent.answers.find((answer) => answer.questionId === questionId).isCorrect : undefined;
    const correctOption = triviaBlock.elements.find((question) => question.id === questionId).metadata.metadata.correct_answer;
    const nextQuestionId = springResponse.nodes[springResponse.nodes.length - 1].nodeId;
    const triviaQuestion = this.getTriviaQuestion(triviaBlock, nextQuestionId);
    return {
      triviaQuestion,
      isCorrect: springResponse.isCorrect,
      status,
      opponentAnsweredCorrectly,
      correctOption,
    };
  }

  private getTriviaQuestion(triviaBlock: any, questionId: string) {
    const questionNode = triviaBlock.elements.find((question) => question.id === questionId);
    const options = questionNode.metadata.options;
    return new TriviaQuestionDto(questionId, questionNode.name, questionNode.metadata.metadata.seconds_to_answer, options);
  }
}
