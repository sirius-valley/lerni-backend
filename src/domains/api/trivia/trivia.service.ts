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
import { TriviaAnswerStatus, TriviaQuestionDetailsDto } from './dto/trivia-question-details.dto';
import { TriviaDetailsDto } from './dto/trivia-details.dto';
import { HeadlandsAdapter } from '../pill/adapters/headlands.adapter';
import { ThreadRequestDto } from '../pill/dtos/thread-request.dto';
import { NotificationService } from '../notification/notification.service';
import { AchievementService } from '../achievement/achievement.service';
// eslint-disable-next-line
const cron = require('node-cron');

@Injectable()
export class TriviaService {
  constructor(
    private readonly triviaRepository: TriviaRepository,
    private readonly programService: ProgramService,
    private readonly springService: SpringPillService,
    private readonly studentService: StudentService,
    private readonly headlandsAdapter: HeadlandsAdapter,
    private readonly notificationService: NotificationService,
    private readonly achievementService: AchievementService,
  ) {
    this.checkIn72Hours();
  }

  private checkIn72Hours = () => {
    cron.schedule('0 * * * *', () => {
      this.checkAllNotFinishStatus();
    });
  };

  public async createOrAssignTriviaMatch(student: StudentDto, programId: string) {
    // check if student is already enrolled in the program
    const programVersion = await this.programService.getProgramVersion(student.id, programId);
    if (programVersion.endDate && programVersion.endDate <= new Date()) throw new HttpException('Program finished', HttpStatus.BAD_REQUEST);
    // check if student has already started a trivia match
    const startedTriviaMatch = await this.triviaRepository.getTriviaMatchByStudentIdAndProgramVersionId(student.id, programVersion.id);
    if (startedTriviaMatch) {
      const opponent = startedTriviaMatch.studentTriviaMatches.find((stm) => stm.studentId !== student.id);
      return new SimpleTriviaDto(
        startedTriviaMatch.triviaId,
        startedTriviaMatch.id,
        new SimpleProgramDto(programVersion.program, 100),
        opponent ? new SimpleStudentDto(opponent.student) : undefined,
      );
    }
    // check if there is a trivia match available
    const triviaMatch = await this.triviaRepository.findTriviaMatchByProgramVersionId(programVersion.id);
    if (triviaMatch) {
      await this.assignMatchToStudent(student.id, triviaMatch.id);
      return new SimpleTriviaDto(
        triviaMatch.triviaId,
        triviaMatch.id,
        new SimpleProgramDto(programVersion.program, 100),
        triviaMatch.studentTriviaMatches[0].student,
      );
    }

    // create new trivia match
    const createdMatch = await this.createTriviaMatch(student.id, programVersion.id);

    // find an opponent
    const opponent = await this.findOpponent(programVersion.id, createdMatch.triviaId);
    if (opponent) {
      await this.assignMatchToStudent(opponent.id, createdMatch.id);
      this.notificationService.sendNotification({
        userId: opponent.id,
        title: 'Te retaron a jugar una trivia',
        message: `${opponent.name} te retó a jugar una trivia del programa: ${programVersion.program.name}! Acordate que tenes 72hs para mostrarle quien sabe mas!`,
      });
    }

    return new SimpleTriviaDto(
      createdMatch.triviaId,
      createdMatch.id,
      new SimpleProgramDto(programVersion.program, 100),
      opponent ? new SimpleStudentDto(opponent) : undefined,
    );
  }

  public async answerTrivia(student: StudentDto, triviaAnswer: TriviaAnswerRequestDto, authorization: string) {
    const triviaMatch = await this.triviaRepository.getTriviaMatchByIdAndStudentId(triviaAnswer.triviaMatchId, student.id);
    if (!triviaMatch) throw new HttpException('Trivia match not found', HttpStatus.NOT_FOUND);
    const studentTriviaMatch = triviaMatch.studentTriviaMatches.find((match) => match.studentId === student.id);
    if (!studentTriviaMatch) throw new HttpException('Trivia match not found', HttpStatus.NOT_FOUND);
    const validTime = await this.checkNotFinishStatus(triviaMatch.studentTriviaMatches, new Date());
    if (studentTriviaMatch.triviaAnswers.length === 0 && validTime) {
      await this.triviaRepository.resetTimer(studentTriviaMatch.id, new Date(new Date().getTime() + 72 * 60 * 60 * 1000));
    } else if (!validTime) {
      throw new HttpException('Time limit is over', HttpStatus.BAD_REQUEST);
    }
    if (this.isAlreadyAnsweredQuestion(studentTriviaMatch.triviaAnswers, triviaAnswer.questionId))
      throw new HttpException('Question already answered', HttpStatus.BAD_REQUEST);

    const springResponse = await this.getSpringResponse(authorization, triviaMatch, triviaAnswer);

    const updatedStudentTriviaMatch = await this.triviaRepository.createTriviaAnswer(
      studentTriviaMatch.id,
      triviaAnswer.questionId,
      triviaAnswer.answer,
      springResponse.correct,
    );

    const opponent = triviaMatch.studentTriviaMatches.find((match) => match.studentId !== student.id);
    const triviaStatus = this.getMatchStatus(updatedStudentTriviaMatch, triviaMatch.trivia, opponent);
    if (triviaStatus !== TriviaAnswerResponseStatus.IN_PROGRESS) {
      if (triviaStatus === TriviaAnswerResponseStatus.WON) await this.achievementService.updateProgress(student.id, 'trivia');
      this.addPoint(student.id, triviaMatch.id, triviaStatus, triviaMatch.trivia.pointsReward, opponent?.studentId);
      if (triviaStatus === TriviaAnswerResponseStatus.LOST && opponent) {
        this.notificationService.sendNotification({
          userId: opponent.studentId,
          title: 'Ganaste una trivia',
          message: 'Bieeen! Ganaste una trivia! Entra para saber mas’',
        });
        await this.achievementService.updateProgress(opponent.studentId, 'trivia');
      } else if (triviaStatus === TriviaAnswerResponseStatus.WON && opponent) {
        this.notificationService.sendNotification({
          userId: opponent.studentId,
          title: 'Perdiste una trivia',
          message: `${student.name} ${student.lastname} te ganó en una trivia. Entrá para saber mas!`,
        });
      }
      await this.updateTriviaMatch(updatedStudentTriviaMatch, triviaStatus);
    }

    return this.getTriviaAnswerResponse(
      JSON.parse(triviaMatch.trivia.block),
      triviaAnswer.questionId,
      springResponse,
      triviaStatus,
      opponent,
    );
  }

  public async getTriviaMatchDetails(student: StudentDto, triviaMatchId: string, authorization: string) {
    const triviaMatch = await this.triviaRepository.getTriviaMatchById(triviaMatchId);
    if (!triviaMatch) throw new HttpException('Trivia match not found', HttpStatus.NOT_FOUND);
    const studentTriviaMatch = triviaMatch.studentTriviaMatches.find((match) => match.studentId === student.id);
    const opponentTriviaMatch = triviaMatch.studentTriviaMatches.find((match) => match.studentId !== student.id);
    const questions = await this.getTriviaMatchQuestions(triviaMatch.trivia, triviaMatch.seed, authorization);
    const triviaStatus = this.getMatchStatus(studentTriviaMatch, triviaMatch.trivia, opponentTriviaMatch);
    const questionsSummary = this.getQuestionSummary(questions, studentTriviaMatch?.triviaAnswers, opponentTriviaMatch?.triviaAnswers);
    const program = triviaMatch.trivia.programVersions[0].programVersion.program;
    return new TriviaDetailsDto({
      triviaMatchId,
      opponent: opponentTriviaMatch?.student ? new SimpleStudentDto(opponentTriviaMatch.student) : undefined,
      programName: program.name,
      finishedDateTime: triviaMatch.finishedDateTime,
      questions: questionsSummary,
      triviaStatus,
    });
  }

  public async adaptThreadToTriviaBlock(headlandsThread: ThreadRequestDto) {
    try {
      return this.headlandsAdapter.adaptThreadIntoTrivia(headlandsThread.thread);
    } catch (e) {
      throw new HttpException('Thread does not follow required format', HttpStatus.BAD_REQUEST);
    }
  }

  private async assignMatchToStudent(studentId: string, triviaMatchId: string) {
    return await this.triviaRepository.createStudentTriviaMatch(studentId, triviaMatchId, new Date());
  }

  private async createTriviaMatch(studentId: string, programVersionId: string) {
    const trivia = await this.triviaRepository.findTriviaByProgramVersionId(programVersionId);
    if (!trivia) throw new HttpException('Trivia not found', HttpStatus.NOT_FOUND);
    return await this.triviaRepository.createTriviaMatch(studentId, trivia.id, new Date());
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
    const triviaMatch = await this.triviaRepository.getTriviaMatchByIdAndStudentId(triviaMatchId, user.id);
    if (!triviaMatch) throw new HttpException('Trivia match not found', HttpStatus.NOT_FOUND);
    const userTriviaMatch = triviaMatch.studentTriviaMatches.find((match) => match.studentId === user.id);
    if (!userTriviaMatch) throw new HttpException('Trivia match not found', HttpStatus.NOT_FOUND);
    const userAnswers = userTriviaMatch.triviaAnswers;
    const lastAnswer = userAnswers[userAnswers.length - 1];
    const dataToSpring = {
      triviaMatchId,
      questionId: lastAnswer ? lastAnswer.questionId : undefined,
      answer: lastAnswer ? JSON.parse(lastAnswer.value) : undefined,
    };
    const opponent = triviaMatch.studentTriviaMatches.find((match) => match.studentId !== user.id);
    const opponentAnswers = opponent ? opponent.triviaAnswers : [];
    const nextAnswer = await this.getSpringResponse(auth, triviaMatch, dataToSpring as TriviaAnswerRequestDto);
    if (triviaMatch) {
      const bubbles: SpringData[] = await this.mergeData(nextAnswer, JSON.parse(triviaMatch?.trivia?.block));
      const questionBubble = bubbles[bubbles.length - 1];
      const options = this.filterOptions(questionBubble.options);
      const status = this.calculateMatchResult(
        userAnswers as TriviaAnswer[],
        opponentAnswers as TriviaAnswer[],
        triviaMatch?.trivia?.questionCount,
      );
      const opponentSplicedAnswers = this.getTriviaAnswersUntilQuestionId(opponentAnswers, status, dataToSpring.questionId);
      return new QuestionTriviaDto(
        new TriviaQuestionDto(questionBubble.id, questionBubble.question, questionBubble.secondsToAnswer, options),
        userAnswers.length + 1,
        triviaMatch?.trivia?.questionCount,
        { me: this.getSimpleAnswers(userAnswers), opponent: this.getSimpleAnswers(opponentSplicedAnswers) },
        status,
        opponent ? new SimpleStudentDto(opponent.student) : undefined,
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
          question: node.nodeContent.content,
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
          optionImages: node.nodeContent.metadata.metadata.option_images,
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
    const options = { limit: Number(10), offset: page >= 1 ? (page - 1) * 10 : 0 };
    const { results, total } = await this.triviaRepository.getTriviaHistory(student.id, options);

    const newResults = results.map((item) => {
      const program = item.triviaMatch.trivia.programVersions[0].programVersion.program;
      const otherMatches = item.triviaMatch.studentTriviaMatches.find((match) => match.studentId !== student.id);
      if (otherMatches) {
        const opponent = new SimpleStudentDto(otherMatches.student);
        const { status, studentScore, opponentScore } = this.getTriviaResult(item, otherMatches);
        return new TriviaHistoryDto(
          item.triviaMatchId,
          status,
          program.name,
          studentScore,
          opponentScore,
          opponent,
          item.createdAt,
          item.triviaMatch.finishedDateTime,
        );
      }
    });

    return { results: newResults, totalPages: Math.ceil(total / 10) };
  }

  private async getProgramByTriviaMatchId(triviaMatchId: string) {
    const triviaMatch = await this.triviaRepository.getTriviaMatchById(triviaMatchId);
    if (!triviaMatch) throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    const trivia = await this.triviaRepository.getTriviaById(triviaMatch?.triviaId);
    if (!trivia) throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    const triviaVersion = await this.triviaRepository.getProgramTriviaVersionByTriviaId(trivia.id);
    if (!triviaVersion) throw new HttpException('Trivia version not found', HttpStatus.NOT_FOUND);
    const program = await this.programService.getProgramByProgramVersionId(triviaVersion?.programVersionId);
    if (!program) throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    return program;
  }

  private getTriviaResult(studentMatch: any, opponentMatch: any) {
    const otherAnswer = studentMatch.triviaAnswers.filter((answer) => answer.isCorrect).length;
    const myAnswer = opponentMatch.triviaAnswers.filter((answer) => answer.isCorrect).length;
    const status =
      otherAnswer > myAnswer
        ? TriviaAnswerResponseStatus.LOST
        : otherAnswer < myAnswer
          ? TriviaAnswerResponseStatus.WON
          : TriviaAnswerResponseStatus.TIED;
    return { status, studentScore: myAnswer, opponentScore: otherAnswer };
  }

  public async getTriviaStatus(student: StudentDto, page: number) {
    const options = { limit: Number(10), offset: (page - 1) * 10 };
    const matches = await this.triviaRepository.getNotFinishTrivia(student.id, options);
    const validMatches = this.checkValidTriviaTime(matches);
    const trivias = await Promise.all(
      validMatches.map(async (match) => {
        return await this.getTriviaMatchStatus(match);
      }),
    );
    const programsWithNoTriviaMatch = await this.triviaRepository.getCompletedProgramsWithNoTriviaMatchByStudentId(student.id);
    programsWithNoTriviaMatch.forEach((studentProgram) => {
      const program = studentProgram.programVersion.program;
      trivias.push(new TriviaHistoryDto(program.id, TriviaAnswerResponseStatus.NOT_STARTED, program.name, 0, 0, null)); // TODO HARDCODED
    });
    return trivias;
  }

  private async getTriviaMatchStatus(match: any) {
    const program = await this.getProgramByTriviaMatchId(match.triviaMatchId);
    const trivia = await this.triviaRepository.getTriviaById(match.triviaMatch.triviaId);
    if (!trivia) return;
    const opponent = await this.triviaRepository.getStudentTriviaMatchNotIdStudent(match.triviaMatchId, match.studentId);
    const status = this.triviaMatchStatus(match, trivia, opponent);
    return new TriviaHistoryDto(
      match.triviaMatchId,
      status,
      program.name,
      10, // TODO HARDCODED
      10, // TODO HARDCODED
      opponent ? new SimpleStudentDto(opponent.student) : null,
      match.triviaMatch.createdAt,
      this.getCompleteBeforeDate(status, match, opponent),
    );
  }

  private getCompleteBeforeDate(status: TriviaAnswerResponseStatus, student: any, opponent?: any) {
    if (!opponent) return student.completeBefore;
    if (status === TriviaAnswerResponseStatus.WAITING) return opponent.completeBefore;
    return student.completeBefore;
  }

  private triviaMatchStatus(triviaMatch: any, trivia: Trivia, opponent?: any) {
    if (triviaMatch._count.triviaAnswers >= trivia.questionCount) return TriviaAnswerResponseStatus.WAITING;
    if (opponent && triviaMatch._count.triviaAnswers === 0) return TriviaAnswerResponseStatus.CHALLENGED;
    return TriviaAnswerResponseStatus.IN_PROGRESS;
  }

  public checkValidTriviaTime(trivias: any[]) {
    const today = new Date();
    return trivias.filter((item) => Math.abs(today.getTime() - item.createdAt) / (1000 * 60 * 60) < 72);
  }

  private isAlreadyAnsweredQuestion(triviaAnswers: TriviaAnswer[], questionId: string) {
    return triviaAnswers.some((answer) => answer.questionId === questionId);
  }

  private async getSpringResponse(authorization: string, triviaMatch: any, answerRequest: TriviaAnswerRequestDto) {
    const block = JSON.parse(triviaMatch.trivia.block);
    block.seed = triviaMatch.seed;
    if (answerRequest?.questionId && answerRequest.answer) {
      return this.springService.answerQuestionnaire(
        authorization,
        block,
        new PillAnswerSpringDto(answerRequest.questionId, answerRequest.answer),
      );
    } else {
      return this.springService.getSpringProgress(JSON.stringify(block), authorization, []);
    }
  }

  private getMatchStatus(studentTriviaMatch: any, trivia: Trivia, opponentTriviaMatch?: any) {
    if (!opponentTriviaMatch) {
      if (studentTriviaMatch.triviaAnswers.length >= trivia.questionCount) return TriviaAnswerResponseStatus.WAITING;
      return TriviaAnswerResponseStatus.IN_PROGRESS;
    } else return this.calculateMatchResult(studentTriviaMatch.triviaAnswers, opponentTriviaMatch.triviaAnswers, trivia.questionCount);
  }

  private calculateMatchResult(studentAnswers: TriviaAnswer[], opponentAnswers: TriviaAnswer[], questionCount: number) {
    const studentCorrectAnswers = studentAnswers.filter((answer) => answer.isCorrect).length;
    const opponentCorrectAnswers = opponentAnswers.filter((answer) => answer.isCorrect).length;
    const studentsQuestionsLeft = questionCount - studentAnswers.length;
    const opponentsQuestionsLeft = questionCount - opponentAnswers.length;
    if (studentAnswers.length === 0) return TriviaAnswerResponseStatus.IN_PROGRESS;
    if (studentCorrectAnswers > opponentCorrectAnswers + opponentsQuestionsLeft) return TriviaAnswerResponseStatus.WON;
    if (studentCorrectAnswers + studentsQuestionsLeft < opponentCorrectAnswers) return TriviaAnswerResponseStatus.LOST;
    if (studentCorrectAnswers === opponentCorrectAnswers && studentsQuestionsLeft <= 0 && opponentsQuestionsLeft <= 0)
      return TriviaAnswerResponseStatus.TIED;
    if (studentAnswers.length >= questionCount) return TriviaAnswerResponseStatus.WAITING;
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
    const opponentAnswers = opponent
      ? this.getTriviaAnswersUntilQuestionId(opponent?.triviaAnswers, status, questionId).map((answer) => {
          return {
            id: answer.questionId,
            isCorrect: answer.isCorrect,
          };
        })
      : undefined;
    const correctOption = triviaBlock.elements.find((question) => question.id === questionId).metadata.metadata.correct_answer;
    const nextQuestionId = springResponse.nodes[springResponse.nodes.length - 1].nodeId;
    const triviaQuestion = this.getTriviaQuestion(triviaBlock, nextQuestionId);
    return {
      triviaQuestion,
      isCorrect: springResponse.correct,
      status,
      opponent: opponent ? new SimpleStudentDto(opponent.student) : undefined,
      opponentAnswers,
      correctOption,
    };
  }

  private getTriviaAnswersUntilQuestionId(answers: TriviaAnswer[], status: TriviaAnswerResponseStatus, questionId?: string) {
    if (!questionId) return [];
    const index = answers.findIndex((answer) => answer.questionId === questionId);
    return index !== -1 && status !== TriviaAnswerResponseStatus.LOST ? answers.slice(0, index + 1) : answers;
  }

  private getTriviaQuestion(triviaBlock: any, questionId: string) {
    const questionNode = triviaBlock.elements.find((question) => question.id === questionId);
    const options = this.filterOptions(questionNode.metadata.options);
    return new TriviaQuestionDto(questionId, questionNode.name, questionNode.metadata.metadata.seconds_to_answer, options);
  }

  private async checkAllNotFinishStatus() {
    const today = new Date();
    const trivias = await this.triviaRepository.getAllNotFinishTrivias();
    trivias.map((trivia) => {
      this.checkNotFinishStatus(trivia, today);
    });
  }

  private async checkNotFinishStatus(trivia: any, today: Date) {
    //add into getStatus
    if (!trivia.completeBefore) return true;
    if (today > trivia.completeBefore) {
      await this.triviaRepository.updateFinishDate(trivia.id, today);
      const triviaMatch = await this.triviaRepository.getStudentMatchbyTriviaMachtId(trivia.triviaMatchId);
      if (!triviaMatch) throw new HttpException('Match not found', HttpStatus.NOT_FOUND);
      if (triviaMatch[0].studentTriviaMatches.length > 1) {
        if (
          triviaMatch[0].studentTriviaMatches[0].finishedDateTime !== null &&
          triviaMatch[0].studentTriviaMatches[1].finishedDateTime !== null
        ) {
          await this.triviaRepository.updateFinishDateTriviaMatch(triviaMatch[0].id);
        }
      } else {
        await this.triviaRepository.updateFinishDateTriviaMatch(triviaMatch[0].id);
      }
      return false;
    } else if (Math.floor((trivia.completeBefore.getTime() - today.getTime()) / (1000 * 60 * 60)) < 3) {
      this.notificationService.sendNotification({
        userId: trivia.studentId,
        title: 'Tenes una trivia sin terminar',
        message: 'Eyy! Te quedan menos de 3 horas para terminar la trivia. Solo te va a tomar 5 minutos!',
      });
    } else if (Math.floor((trivia.completeBefore.getTime() - today.getTime()) / (1000 * 60)) < 20) {
      this.notificationService.sendNotification({
        userId: trivia.studentId,
        title: 'Falta poco! La victoria se asoma!',
        message: 'Te quedan menos de 20 minutos para terminar la trivia. Entrá y demostrá quien es el mejor!',
      });
    }
    return true;
  }

  private filterOptions(options: string[]) {
    return options.filter((option) => option !== 'timeout' && option !== 'left');
  }

  private getSimpleAnswers(answers: TriviaAnswer[]) {
    return answers.map((answer) => {
      return {
        id: answer.questionId,
        isCorrect: answer.isCorrect,
      };
    });
  }

  private async getTriviaMatchQuestions(trivia: Trivia, seed: number, authorization: string) {
    const questions = Array.from({ length: trivia.questionCount - 1 }, () => new PillAnswerSpringDto('', 'timeout'));
    const triviaBlock = JSON.parse(trivia.block);
    triviaBlock.seed = seed;
    const springResponse = await this.springService.getSpringProgress(JSON.stringify(triviaBlock), authorization, questions);
    return springResponse.nodes;
  }

  private getQuestionSummary(triviaNodes: any, userAnswers?: TriviaAnswer[], opponentAnswers?: TriviaAnswer[]): TriviaQuestionDetailsDto[] {
    return triviaNodes.map((question) => {
      const userAnswer = userAnswers?.find((answer) => answer.questionId === question.nodeId);
      const opponentAnswer = opponentAnswers?.find((answer) => answer.questionId === question.nodeId);
      const userAnswerStatus = this.getAnswerStatus(userAnswer);
      const opponentAnswerStatus = this.getAnswerStatus(opponentAnswer);
      return {
        questionId: question.nodeId,
        question: question.nodeContent.content,
        correctOption: question.nodeContent.metadata.metadata.correct_answer,
        selectedOption: userAnswer?.value,
        opponentAnswer: opponentAnswer?.value,
        userAnswerStatus,
        opponentAnswerStatus,
      };
    });
  }

  private getAnswerStatus(answer?: TriviaAnswer) {
    if (!answer) return TriviaAnswerStatus.UNANSWERED;
    if (answer.isCorrect) return TriviaAnswerStatus.CORRECT;
    if (answer.value === 'timeout') return TriviaAnswerStatus.TIMEDOUT;
    if (answer.value === 'left') return TriviaAnswerStatus.LEFT;
    return TriviaAnswerStatus.INCORRECT;
  }

  public async delete(triviaId: string) {
    return await this.triviaRepository.delete(triviaId);
  }
  private addPoint(studentId: string, triviaMatchId: string, status: TriviaAnswerResponseStatus, points: number, opponent?: string) {
    switch (status) {
      case TriviaAnswerResponseStatus.WON:
        this.studentService.addPoints(studentId, points, triviaMatchId, 'trivia');
        break;
      case TriviaAnswerResponseStatus.TIED:
        this.studentService.addPoints(studentId, points / 2, triviaMatchId, 'trivia');
        if (opponent) this.studentService.addPoints(opponent, points / 2, triviaMatchId, 'trivia');
        break;
      case TriviaAnswerResponseStatus.LOST:
        if (opponent) this.studentService.addPoints(opponent, points, triviaMatchId, 'trivia');
    }
  }
}
