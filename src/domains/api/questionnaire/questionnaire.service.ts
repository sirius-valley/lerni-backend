import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QuestionnaireRepository } from './questionnaire.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { AnswerRequestDto } from '../pill/dtos/answer-request.dto';
import { QuestionnaireAnswer, QuestionnaireVersion } from '@prisma/client';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { PillAnswerSpringDto } from '../pill-external-api/dtos/pill-answer-spring.dto';
import { QuestionnaireProgressDto, QuestionnaireState } from './dtos/questionnaire-progress.dto';
import { PillService } from '../pill/pill.service';
import { questionnaireAnswerPoints } from '../../../const';

@Injectable()
export class QuestionnaireService {
  constructor(
    private readonly questionnaireRepository: QuestionnaireRepository,
    private readonly springPillService: SpringPillService,
    private readonly pillService: PillService,
  ) {}

  public async answerQuestionnaire(authorization: string, student: StudentDto, answerRequest: AnswerRequestDto) {
    const questionnaireSubmission = await this.getQuestionnaireSubmission(answerRequest.pillId, student.id);
    if (this.questionAlreadyAnswered(questionnaireSubmission.questionnaireAnswers, answerRequest.questionId))
      throw new HttpException('Question already answered', HttpStatus.CONFLICT);

    const springProgress = await this.getSpringProgress(authorization, questionnaireSubmission, answerRequest);
    console.log(springProgress, 'springProgress');

    const updatedSubmission = await this.questionnaireRepository.createQuestionnaireAnswer(
      questionnaireSubmission.id,
      answerRequest.questionId,
      answerRequest.answer,
      springProgress.correct,
      springProgress.progress,
    );

    if (this.isQuestionnaireFailed(updatedSubmission.questionnaireAnswers, updatedSubmission.questionnaireVersion)) {
      const data = {
        bubbles: [],
        isCorrect: false,
        progress: springProgress.progress,
        state: QuestionnaireState.Failed,
      };
      return new QuestionnaireProgressDto(data);
    }

    const replacedQuestionnaire = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);
    const formattedBlock = this.formatQuestionnaireBlock(replacedQuestionnaire, JSON.parse(updatedSubmission.questionnaireVersion.block));

    if (formattedBlock.state === QuestionnaireState.Completed) {
      const pointsAwarded = this.calculatePointsAwarded(updatedSubmission.questionnaireAnswers);
      await this.questionnaireRepository.saveCompletedQuestionnaireSubmissionBySubmissionId(updatedSubmission.id, pointsAwarded);
    }

    return new QuestionnaireProgressDto(formattedBlock);
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

  private async getSpringProgress(authorization: string, questionnaireSubmission: any, answerRequest: AnswerRequestDto) {
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
      state: springProgress.completed ? QuestionnaireState.Completed : QuestionnaireState.InProgress,
      progress: springProgress.progress,
      bubbles: this.pillService.mergeData(springProgress, questionnaireBlock),
    };
  }

  private calculatePointsAwarded(questionnaireAnswers: QuestionnaireAnswer[]) {
    return questionnaireAnswers.filter((questionnaireAnswer) => questionnaireAnswer.isCorrect).length * questionnaireAnswerPoints;
  }
}
