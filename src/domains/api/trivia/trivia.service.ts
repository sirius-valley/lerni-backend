import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StudentDto } from '../student/dtos/student.dto';
import { TriviaRepository } from './trivia.repository';
import { ProgramService } from '../program/program.service';
import { SimpleTriviaDto } from './dto/simple-trivia.dto';
import { SimpleProgramDto } from '../program/dtos/simple-program.dto';
import { SimpleStudentDto } from '../student/dtos/simple-student.dto';
import { QuestionTriviaDto } from './dto/question-trivia.dto';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { SpringData } from './dto/SpringResponse-interface';
import { QuestionTriviaStatus } from './dto/question-trivia-status.enum';

@Injectable()
export class TriviaService {
  constructor(
    private readonly triviaRepository: TriviaRepository,
    private readonly programService: ProgramService,
    private readonly springService: SpringPillService,
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

  public async getQuestion(auth: string, user: StudentDto, triviaMatchId: string) {
    const userAnswers = await this.triviaRepository.getTriviaAnswersByTriviaMatchId(user.id, triviaMatchId);
    const triviaMatch = await this.triviaRepository.getTriviaMatchById(triviaMatchId);
    const opponentAnsewrs = await this.triviaRepository.getOponentAnswer(user.id, triviaMatchId);
    const neextAnswer = await this.springService.getSpringProgress(triviaMatch?.trivia?.block, auth, []);
    if (triviaMatch) {
      const bubbles: SpringData[] = await this.mergeData(neextAnswer, JSON.parse(triviaMatch?.trivia?.block));
      return new QuestionTriviaDto(
        bubbles[bubbles.length - 1].value,
        bubbles[bubbles.length - 1].options,
        20,
        userAnswers.length + 1,
        triviaMatch?.trivia?.questionCount,
        { me: userAnswers, opponent: opponentAnsewrs },
        this.calculateStatus(triviaMatch?.trivia?.questionCount, userAnswers, opponentAnsewrs),
      );
    }
  }

  private mergeData(springProgress: any, pillBlock: any) {
    return springProgress.nodes.map((node) => {
      const element = pillBlock.elements.find((element) => {
        return element.id === node.nodeId;
      });
      const type = element?.metadata?.metadata.lerni_question_type ?? 'text';
      return {
        id: node.nodeId,
        type: type,
        ...this.calculateExtraAttributes(node, type),
      } as SpringData;
    });
  }

  private calculateExtraAttributes(node: any, type: string) {
    switch (type) {
      case 'text':
      case 'image':
        return { content: node.nodeContent.content };
      case 'free-text':
        return { content: node.answer };
      case 'single-choice':
        return {
          value: node.answer,
          options: node.nodeContent.metadata.options,
          correct: node.correct,
          correctValue: node.answer !== '' ? (node.correct ? [node.nodeContent.metadata.metadata.correct_answer] : []) : undefined,
        };
      case 'multiple-choice':
        return {
          value: node.answer,
          options: node.nodeContent.metadata.options,
          correct: node.correct,
          correctValue:
            node.answer !== '' ? this.findIntersection(node.nodeContent.metadata.metadata.correct_answer, node.answer) : undefined,
        };
      case 'carousel':
        return {
          value: node.answer,
          options: node.nodeContent.metadata.options,
          correct: node.correct,
          optionDescriptions: node.nodeContent.metadata.metadata.option_descriptions,
          correctValue: node.answer !== '' ? (node.correct ? [node.nodeContent.metadata.metadata.correct_answer] : []) : undefined,
        };
    }
  }

  private findIntersection(a: string | string[], b: string | string[]) {
    const aSet = new Set(a);
    const bSet = new Set(b);

    return [...aSet].filter((x) => bSet.has(x));
  }

  private calculateStatus(totalQuestion: number, userAnswers: any[], opponentAnswer: any[]) {
    if (userAnswers.length === totalQuestion) {
      if (userAnswers.length === opponentAnswer.length) {
        const totalUser = userAnswers.filter((answer) => answer.isCorrect === true).length;
        const totalOpponent = opponentAnswer.filter((answer) => answer.isCorrect === true).length;
        if (totalUser > totalOpponent) {
          return QuestionTriviaStatus.WINNER;
        } else {
          return QuestionTriviaStatus.LOSER;
        }
      }
      return QuestionTriviaStatus.FINISHED;
    } else if (userAnswers.length === 0) {
      return QuestionTriviaStatus.NOT_STARTED;
    }
    return QuestionTriviaStatus.PLAYING;
  }
}
