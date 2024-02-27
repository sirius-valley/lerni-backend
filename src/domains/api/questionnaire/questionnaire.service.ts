import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QuestionnaireRepository } from './questionnaire.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { QuestionnaireAnswer, QuestionnaireVersion } from '@prisma/client';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { PillAnswerSpringDto } from '../pill-external-api/dtos/pill-answer-spring.dto';
import { QuestionnaireAnswerDto, QuestionnaireState } from './dtos/questionnaire-answer.dto';
import { questionnaireAnswerPoints } from '../../../const';
import { QuestionnaireAnswerResponseDto } from './dtos/questionnaire-answer-response.dto';
import { TeacherDto } from '../pill/dtos/teacher.dto';
import { QuestionnaireAnswerRequestDto } from './dtos/questionnaire-answer-request.dto';
import { QuestionnaireProgressResponseDto } from './dtos/questionnaire-progress-response.dto';
import { QuestionnaireProgressDto } from './dtos/questionnaire-progress.dto';

@Injectable()
export class QuestionnaireService {
  constructor(
    private readonly questionnaireRepository: QuestionnaireRepository,
    private readonly springPillService: SpringPillService,
  ) {}

  public async answerQuestionnaire(
    authorization: string,
    student: StudentDto,
    answerRequest: QuestionnaireAnswerRequestDto,
  ): Promise<QuestionnaireAnswerResponseDto> {
    const questionnaireSubmission = await this.getQuestionnaireSubmission(answerRequest.questionnaireId, student.id);
    if (this.questionAlreadyAnswered(questionnaireSubmission.questionnaireAnswers, answerRequest.questionId))
      throw new HttpException('Question already answered', HttpStatus.CONFLICT);

    const springProgress = await this.getSpringProgress(authorization, questionnaireSubmission, answerRequest);

    const updatedSubmission = await this.questionnaireRepository.createQuestionnaireAnswer(
      questionnaireSubmission.id,
      answerRequest.questionId,
      answerRequest.answer,
      springProgress.correct,
      springProgress.progress,
    );

    const teacher = await this.getTeacher(answerRequest.questionnaireId);
    const correctValues = this.getCorrectValues(answerRequest, springProgress, JSON.parse(updatedSubmission.questionnaireVersion.block));

    if (this.isQuestionnaireFailed(updatedSubmission.questionnaireAnswers, updatedSubmission.questionnaireVersion)) {
      const data = {
        bubbles: [],
        isCorrect: false,
        progress: springProgress.progress,
        pointsAwarded: 0,
        state: QuestionnaireState.FAILED,
      };
      await this.questionnaireRepository.setQuestionnaireSubmissionCompletedDateTime(updatedSubmission.id);
      return { questionnaire: new QuestionnaireAnswerDto(data, correctValues), teacher };
    }

    const replacedQuestionnaire = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);
    const formattedBlock = this.formatQuestionnaireBlock(replacedQuestionnaire, JSON.parse(updatedSubmission.questionnaireVersion.block));

    if (formattedBlock.state === QuestionnaireState.COMPLETED) {
      const pointsAwarded = this.calculatePointsAwarded(updatedSubmission.questionnaireAnswers);
      await this.questionnaireRepository.saveCompletedQuestionnaireSubmissionBySubmissionId(updatedSubmission.id, pointsAwarded);
    }

    return { questionnaire: new QuestionnaireAnswerDto(formattedBlock, correctValues), teacher };
  }

  async getQuestionnaireVersionByPillId(
    authorization: string,
    user: StudentDto,
    questionnaireId: string,
  ): Promise<QuestionnaireProgressResponseDto> {
    const questionnaireVersion = await this.questionnaireRepository.getQuestionnaireVersionByQuestionnaireIdAndStudentId(
      questionnaireId,
      user.id,
    );
    if (!questionnaireVersion) throw new HttpException('Questionnaire not found', HttpStatus.NOT_FOUND);

    const springProgress = await this.springPillService.getSpringProgress(
      questionnaireVersion.block,
      authorization,
      questionnaireVersion.questionnaireSubmissions[0]?.questionnaireAnswers.map(
        (answer) => new PillAnswerSpringDto(answer.questionId, JSON.parse(answer.value)),
      ) ?? [],
    );

    const teacher = await this.getTeacher(questionnaireId);
    const formattedSpringProgress = this.formatSpringProgress(
      springProgress,
      questionnaireVersion.questionnaireSubmissions[0]?.questionnaireAnswers,
    );
    const replacedQuestionnaire = this.replaceFullName(formattedSpringProgress, user.name + ' ' + user.lastname);
    const formattedBlock = this.formatQuestionnaireBlock(replacedQuestionnaire, JSON.parse(questionnaireVersion.block));

    return { questionnaire: new QuestionnaireProgressDto(formattedBlock), teacher };
  }

  private formatSpringProgress(springProgress: any, answers: QuestionnaireAnswer[]) {
    return {
      ...springProgress,
      nodes: springProgress.nodes.map((node) => {
        const answer = answers?.find((answer) => answer.questionId === node.nodeId);
        return {
          ...node,
          correct: answer?.isCorrect,
        };
      }),
    };
  }

  private async getQuestionnaireSubmission(questionnaireId: string, studentId: string) {
    const questionnaireSubmission = await this.questionnaireRepository.getQuestionnaireSubmissionByQuestionnaireIdAndStudentId(
      questionnaireId,
      studentId,
    );
    if (questionnaireSubmission) return questionnaireSubmission;
    return await this.createQuestionnaireSubmission(questionnaireId, studentId);
  }

  private async createQuestionnaireSubmission(questionnaireId: string, studentId: string) {
    const studentProgram = await this.questionnaireRepository.getStudentProgramByStudentIdAndQuestionnaireId(studentId, questionnaireId);
    if (!studentProgram) throw new HttpException('Student program not found', HttpStatus.FORBIDDEN);
    const questionnaireVersion = await this.questionnaireRepository.getQuestionnaireVersionByQuestionnaireIdAndStudentId(
      questionnaireId,
      studentId,
    );
    if (!questionnaireVersion) throw new HttpException('Questionnaire Version not found', HttpStatus.NOT_FOUND);
    return await this.questionnaireRepository.createQuestionnaireSubmission(questionnaireVersion.id, studentId);
  }

  private questionAlreadyAnswered(questionnaireAnswers: QuestionnaireAnswer[], questionId: string) {
    return !!questionnaireAnswers.find((questionnaireAnswer) => questionnaireAnswer.questionId === questionId);
  }

  private async getSpringProgress(authorization: string, questionnaireSubmission: any, answerRequest: QuestionnaireAnswerRequestDto) {
    const springDto = new PillAnswerSpringDto(answerRequest.questionId, answerRequest.answer);
    return await this.springPillService.answerQuestionnaire(authorization, questionnaireSubmission.questionnaireVersion.block, springDto);
  }

  private isQuestionnaireFailed(questionnaireAnswers: QuestionnaireAnswer[], questionnaireVersion: QuestionnaireVersion) {
    const passingScore = questionnaireVersion.passsing_score;
    const questionCount = questionnaireVersion.questionCount;
    const incorrectAnswers = questionnaireAnswers.filter((questionnaireAnswer) => !questionnaireAnswer.isCorrect);
    return (incorrectAnswers.length / questionCount) * 100 > passingScore;
  }

  private replaceFullName(pill: any, fullName: string) {
    return JSON.parse(JSON.stringify(pill).replace('@fullname', fullName));
  }

  private formatQuestionnaireBlock(springProgress: any, questionnaireBlock: any) {
    return {
      isCorrect: springProgress.correct,
      state: springProgress.completed ? QuestionnaireState.COMPLETED : QuestionnaireState.INPROGRESS,
      progress: springProgress.progress,
      pointsAwarded: springProgress.correct ? questionnaireAnswerPoints : 0,
      bubbles: this.mergeData(springProgress, questionnaireBlock),
    };
  }

  private calculatePointsAwarded(questionnaireAnswers: QuestionnaireAnswer[]) {
    return questionnaireAnswers.filter((questionnaireAnswer) => questionnaireAnswer.isCorrect).length * questionnaireAnswerPoints;
  }

  private async getTeacher(questionnaireId: string) {
    const teacher = await this.questionnaireRepository.getTeacherByQuestionnaireId(questionnaireId);
    if (!teacher) throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
    return new TeacherDto(teacher);
  }

  private mergeData(springProgress: any, questionnaireBlock: any) {
    return springProgress.nodes.map((node) => {
      const element = questionnaireBlock.elements.find((element) => {
        return element.id === node.nodeId;
      });
      const type = element?.metadata?.metadata.lerni_question_type ?? 'text';
      return {
        id: node.nodeId,
        type: type,
        ...this.calculateExtraAttributes(node, type),
      };
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
          pointsAwarded: node.answer !== '' ? (node.correct ? questionnaireAnswerPoints : 0) : undefined,
          correctValue: node.answer !== '' ? (node.correct ? [node.nodeContent.metadata.metadata.correct_answer] : []) : undefined,
        };
      case 'multiple-choice':
        return {
          value: node.answer,
          options: node.nodeContent.metadata.options,
          correct: node.correct,
          pointsAwarded: node.answer !== '' ? (node.correct ? questionnaireAnswerPoints : 0) : undefined,
          correctValue:
            node.answer !== '' ? this.findIntersection(node.nodeContent.metadata.metadata.correct_answer, node.answer) : undefined,
        };
      case 'carousel':
        return {
          value: node.answer,
          options: node.nodeContent.metadata.options,
          correct: node.correct,
          pointsAwarded: node.answer !== '' ? (node.correct ? questionnaireAnswerPoints : 0) : undefined,
          optionDescriptions: node.nodeContent.metadata.metadata.option_descriptions,
          correctValues: node.answer !== '' ? (node.correct ? [node.nodeContent.metadata.metadata.correct_answer] : []) : undefined,
        };
    }
  }

  private findIntersection(a: string | string[], b: string | string[]) {
    const aSet = new Set(a);
    const bSet = new Set(b);

    return [...aSet].filter((x) => bSet.has(x));
  }

  private getQuestionNode(questionId: string, questionnaireBlock: any) {
    return questionnaireBlock.elements.find((element) => element.id === questionId);
  }

  private getCorrectValues(answerRequest: QuestionnaireAnswerRequestDto, springProgress: any, questionnaireBlock: any) {
    const questionElement = this.getQuestionNode(answerRequest.questionId, questionnaireBlock);
    switch (questionElement.metadata.metadata.lerni_question_type) {
      case 'single-choice':
      case 'carousel':
        return springProgress.correct ? [questionElement.metadata.metadata.correct_answer] : [];
      case 'multiple-choice':
        return this.findIntersection(questionElement.metadata.metadata.correct_answer, answerRequest.answer);
      default:
        return [];
    }
  }
}
