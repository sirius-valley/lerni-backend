import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StudentDto } from '../student/dtos/student.dto';
import { TriviaRepository } from './trivia.repository';
import { ProgramService } from '../program/program.service';
import { SimpleTriviaDto } from './dto/simple-trivia.dto';
import { SimpleProgramDto } from '../program/dtos/simple-program.dto';
import { SimpleStudentDto } from '../student/dtos/simple-student.dto';
import { QuestionTriviaDto } from './dto/question-trivia.dto';
import { SpringData } from './dto/SpringResponse-interface';
import { TriviaAnswerRequestDto } from './dto/trivia-answer-request.dto';
import { StudentTriviaMatch, Trivia, TriviaAnswer } from '@prisma/client';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { PillAnswerSpringDto } from '../pill-external-api/dtos/pill-answer-spring.dto';
import { TriviaAnswerResponseStatus } from './dto/trivia-answer-response.dto';
import { TriviaQuestionDto } from './dto/trivia-question.dto';
import { StudentService } from '../student/student.service';
import { TriviaHistoryDto } from './dto/trivia-history.dto';
import { TriviaStatus } from './dto/trivia-interfaces.interface';

@Injectable()
export class TriviaService {
  constructor(
    private readonly triviaRepository: TriviaRepository,
    private readonly programService: ProgramService,
    private readonly springService: SpringPillService,
    private readonly studentService: StudentService,
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
    const studentTriviaMatch = await this.triviaRepository.getStudentTriviaMatchByStudentIdAndTriviaMatchId(
      student.id,
      triviaAnswer.triviaMatchId,
    );
    if (!studentTriviaMatch) throw new HttpException('Trivia match not found', HttpStatus.NOT_FOUND);
    if (this.isAlreadyAnsweredQuestion(studentTriviaMatch.triviaAnswers, triviaAnswer.questionId))
      throw new HttpException('Question already answered', HttpStatus.BAD_REQUEST);

    const springResponse = await this.getSpringResponse(authorization, studentTriviaMatch.triviaMatch, triviaAnswer);

    const updatedStudentTriviaMatch = await this.triviaRepository.createTriviaAnswer(
      studentTriviaMatch.id,
      triviaAnswer.questionId,
      triviaAnswer.answer,
      springResponse.correct,
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

  public async getQuestion(auth: string, user: StudentDto, triviaMatchId: string) {
    const userAnswers = await this.triviaRepository.getTriviaAnswersByTriviaMatchId(user.id, triviaMatchId);
    const triviaMatch = await this.triviaRepository.getTriviaMatchById(triviaMatchId);
    if (!triviaMatch) throw new HttpException('Trivia match not found', HttpStatus.NOT_FOUND);
    const dataToSpring = {
      triviaMatchId: triviaMatch.id,
      questionId: userAnswers[0]?.questionId ? userAnswers[0].questionId : undefined,
      answer: userAnswers[0]?.value ? JSON.parse(userAnswers[0].value) : undefined,
    };
    const opponentAnswers = await this.triviaRepository.getOponentAnswer(user.id, triviaMatchId);
    const nextAnswer = await this.getSpringResponse(auth, triviaMatch, dataToSpring as TriviaAnswerRequestDto);
    if (triviaMatch) {
      const bubbles: SpringData[] = await this.mergeData(nextAnswer, JSON.parse(triviaMatch?.trivia?.block));
      const questionBubble = bubbles[bubbles.length - 1];
      const options = this.filterOptions(questionBubble.options);
      return new QuestionTriviaDto(
        new TriviaQuestionDto(questionBubble.id, questionBubble.value, questionBubble.secondsToAnswer, options),
        userAnswers.length + 1,
        triviaMatch?.trivia?.questionCount,
        { me: this.getSimpleAnswers(userAnswers), opponent: this.getSimpleAnswers(opponentAnswers as TriviaAnswer[]) },
        this.calcualteMatchResult(userAnswers as TriviaAnswer[], opponentAnswers as TriviaAnswer[], triviaMatch?.trivia?.questionCount),
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
          secondsToAnswer: node.nodeContent.metadata.metadata.seconds_to_answer,
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

  public async getTriviaHistory(student: StudentDto, page: number): Promise<any> {
    const options = { limit: Number(10), offset: (page - 1) * 10 };
    const { results, total } = await this.triviaRepository.getTriviaHistory(student.id, options);

    const data = results.map(async (item) => {
      const program = await this.getProgramByTriviaMatchId(item.triviaMatchId);
      const otherMatches = await this.triviaRepository.getStudentTriviaMatchNotIdStudent(item.triviaMatchId, item.studentId, options);
      if (otherMatches) {
        const oponentUser = await this.studentService.getStudentById(otherMatches.studentId);
        const { result, me, opponent } = await this.getTriviaResult(item.studentId, otherMatches.studentId);
        return new TriviaHistoryDto(item.id, result, program.name, { me, opponent }, item.createdAt, oponentUser);
      }
    });

    return { results: data, totalPages: Math.ceil(total / 10) };
  }

  private async getProgramByTriviaMatchId(triviaMatchId: string) {
    const triviaMatch = await this.triviaRepository.getTriviaMatchById(triviaMatchId);
    if (!triviaMatch) throw new HttpException('Progam not found', HttpStatus.NOT_FOUND);
    const trivia = await this.triviaRepository.getTriviaById(triviaMatch?.triviaId);
    if (!trivia) throw new HttpException('Progam not found', HttpStatus.NOT_FOUND);
    const triviaVersion = await this.triviaRepository.getProgramTriviaVersionByTriviaId(trivia.id);
    if (!triviaVersion) throw new HttpException('Trivia version not found', HttpStatus.NOT_FOUND);
    const program = await this.programService.getProgramByProgramVersionId(triviaVersion?.programVersionId);
    if (!program) throw new HttpException('Progam not found', HttpStatus.NOT_FOUND);
    return program;
  }

  private async getTriviaResult(studentId: string, oponentId: string) {
    const otherAnswer = await this.triviaRepository.getTriviaAnswerCorrectCountByMatchId(oponentId);
    const myAnswer = await this.triviaRepository.getTriviaAnswerCorrectCountByMatchId(studentId);
    return {
      result: otherAnswer > myAnswer ? TriviaStatus.LOST : otherAnswer < myAnswer ? TriviaStatus.WON : TriviaStatus.TIED,
      me: myAnswer,
      opponent: otherAnswer,
    };
  }

  private isAlreadyAnsweredQuestion(triviaAnswers: TriviaAnswer[], questionId: string) {
    return triviaAnswers.some((answer) => answer.questionId === questionId);
  }

  private async getSpringResponse(authorization: string, triviaMatch: any, answerRequest: TriviaAnswerRequestDto) {
    const block = JSON.parse(triviaMatch.trivia.block);
    block.seed = triviaMatch.seed;
    if (answerRequest?.questionId && answerRequest.answer) {
      return this.springPillService.answerQuestionnaire(
        authorization,
        block,
        new PillAnswerSpringDto(answerRequest.questionId, answerRequest.answer),
      );
    } else {
      return this.springPillService.getSpringProgress(JSON.stringify(block), authorization, []);
    }
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
    if (studentAnswers.length === 0) return TriviaAnswerResponseStatus.IN_PROGRESS;
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
    const opponentTriviaAnswer = opponent?.triviaAnswers.find((answer) => answer.questionId === questionId);
    const opponentAnswer = opponentTriviaAnswer
      ? {
          id: questionId,
          isCorrect: opponentTriviaAnswer.isCorrect,
        }
      : undefined;
    const correctOption = triviaBlock.elements.find((question) => question.id === questionId).metadata.metadata.correct_answer;
    const nextQuestionId = springResponse.nodes[springResponse.nodes.length - 1].nodeId;
    const triviaQuestion = this.getTriviaQuestion(triviaBlock, nextQuestionId);
    return {
      triviaQuestion,
      isCorrect: springResponse.correct,
      status,
      opponentAnswer,
      correctOption,
    };
  }

  private getTriviaQuestion(triviaBlock: any, questionId: string) {
    const questionNode = triviaBlock.elements.find((question) => question.id === questionId);
    const options = this.filterOptions(questionNode.metadata.options);
    return new TriviaQuestionDto(questionId, questionNode.name, questionNode.metadata.metadata.seconds_to_answer, options);
  }

  private filterOptions(options: string[]) {
    return options.filter((option) => option !== 'timeout');
  }

  private getSimpleAnswers(answers: TriviaAnswer[]) {
    return answers.map((answer) => {
      return {
        id: answer.questionId,
        isCorrect: answer.isCorrect,
      };
    });
  }
}
