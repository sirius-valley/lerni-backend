import { PillRepository } from './pill.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { PillAnswerSpringDto } from '../pill-external-api/dtos/pill-answer-spring.dto';
import { introductionID, introductionTeacher, introductionVariables, questionnaireAnswerPoints } from '../../../const';
import { PillAnswer } from '@prisma/client';
import { AnswerRequestDto } from './dtos/answer-request.dto';
import { PillProgressResponseDto } from './dtos/pill-progress-response.dto';
import { TeacherDto } from './dtos/teacher.dto';
import { PillDto } from './dtos/pill.dto';
import { StudentRepository } from '../student/student.repository';
import { HeadlandsAdapter } from './adapters/headlands.adapter';
import { PillBlockDto } from './dtos/pill-block.dto';
import { ThreadRequestDto } from './dtos/thread-request.dto';

@Injectable()
export class PillService {
  constructor(
    private readonly pillRepository: PillRepository,
    private readonly springPillService: SpringPillService,
    private readonly studentRepository: StudentRepository,
    private readonly headlandsAdapter: HeadlandsAdapter,
  ) {}

  public async getIntroduction(authorization: string, student: StudentDto) {
    const introduction = await this.pillRepository.getPillVersionByPillIdAndStudentId(introductionID, student.id);
    if (!introduction) throw new HttpException('Introduction not found', HttpStatus.NOT_FOUND);
    const answers = introduction.pillSubmissions?.length === 1 ? introduction.pillSubmissions[0].pillAnswers : [];
    const springProgress = await this.springPillService.getSpringProgress(introduction.block, authorization, answers);
    const replacedPill = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);
    const formattedPillBlock = this.formatPillBlock(replacedPill, JSON.parse(introduction.block));

    return {
      pill: new PillDto(introduction.pill, introduction, formattedPillBlock),
      teacher: introductionTeacher,
    };
  }

  public async getPillVersionByPillId(authorization: string, student: StudentDto, pillId: string): Promise<PillProgressResponseDto> {
    const pillVersion = await this.pillRepository.getPillByPillIdAndStudentId(pillId, student.id);
    if (!pillVersion) throw new HttpException('Pill not found', HttpStatus.NOT_FOUND);
    const teacher = await this.pillRepository.getTeacherByPillId(pillId);
    if (!teacher) throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
    const answers =
      (await this.pillRepository.getPillSubmissionByPillIdAndStudentId(pillId, student.id))?.pillAnswers?.map(
        (answer) => new PillAnswerSpringDto(answer.questionId, JSON.parse(answer.value)),
      ) || [];
    const springProgress = await this.springPillService.getSpringProgress(pillVersion.block, authorization, answers);
    if (!springProgress) throw new HttpException('Error while calculating progress', HttpStatus.INTERNAL_SERVER_ERROR);
    const replacedPill = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);
    const formattedPillBlock = this.formatPillBlock(replacedPill, JSON.parse(pillVersion.block));

    return {
      pill: new PillDto(pillVersion.pill, pillVersion, formattedPillBlock),
      teacher: new TeacherDto(teacher),
    };
  }

  public async answerPill(authorization: string, student: StudentDto, answerRequest: AnswerRequestDto): Promise<PillProgressResponseDto> {
    const pillSubmission = await this.getPillSubmission(answerRequest, student);
    if (this.questionAlreadyAnswered(pillSubmission.pillAnswers, answerRequest.questionId))
      throw new HttpException('Question already answered', HttpStatus.CONFLICT);

    const teacher = await this.pillRepository.getTeacherByPillId(answerRequest.pillId);

    const springProgress = await this.getSpringProgress(authorization, pillSubmission, answerRequest);

    await this.pillRepository.createPillAnswer(pillSubmission.id, answerRequest.questionId, answerRequest.answer, springProgress.progress);
    if (answerRequest.pillId === introductionID) {
      student = await this.saveIntroductionProgress(student, answerRequest);
    }

    const replacedPill = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);
    const formattedPillBlock = this.formatPillBlock(replacedPill, JSON.parse(pillSubmission.pillVersion.block));

    const teacherDto = this.getTeacher(answerRequest, teacher);

    return {
      pill: new PillDto(pillSubmission.pillVersion.pill, pillSubmission.pillVersion, formattedPillBlock),
      teacher: answerRequest.pillId === introductionID ? introductionTeacher : teacherDto,
    };
  }

  public async adaptHeadlandsThreadToPillBlock(headlandsThread: ThreadRequestDto): Promise<PillBlockDto> {
    try {
      return this.headlandsAdapter.adaptThreadIntoPill(headlandsThread.thread);
    } catch (e) {
      throw new HttpException('Thread does not follow required format', HttpStatus.BAD_REQUEST);
    }
  }

  private getTeacher(answerRequest: AnswerRequestDto, teacher: TeacherDto | null) {
    if (introductionID === answerRequest.pillId) teacher = introductionTeacher as any;
    if (!teacher) throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
    return new TeacherDto(teacher);
  }

  private formatPillBlock(springProgress: any, pillBlock: any) {
    return {
      completed: springProgress.completed,
      progress: springProgress.progress,
      bubbles: this.mergeData(springProgress, pillBlock),
    };
  }

  public mergeData(springProgress: any, pillBlock: any) {
    return springProgress.nodes.map((node) => {
      const element = pillBlock.elements.find((element) => {
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
      case 'multiple-choice':
        return { value: node.answer, options: node.nodeContent.metadata.options };
      case 'carousel':
        return {
          value: node.answer,
          options: node.nodeContent.metadata.options,
          correct: node.correct,
          pointsAwarded: node.correct ? questionnaireAnswerPoints : 0,
          optionDescriptions: node.nodeContent.metadata.metadata.optionDescriptions,
        };
    }
  }

  private async getSpringProgress(authorization: string, pillSubmission: any, answerRequest: AnswerRequestDto) {
    const springDto = new PillAnswerSpringDto(answerRequest.questionId, answerRequest.answer);
    return await this.springPillService.answerPill(authorization, pillSubmission.pillVersion.block, springDto);
  }

  private async getPillSubmission(answerRequest: AnswerRequestDto, student: StudentDto) {
    const pillSubmission = await this.pillRepository.getPillSubmissionByPillIdAndStudentId(answerRequest.pillId, student.id);
    if (pillSubmission) return pillSubmission;
    return await this.createPillSubmission(answerRequest.pillId, student.id);
  }

  private async createPillSubmission(pillId: string, studentId: string) {
    const studentProgram = await this.pillRepository.getStudentProgramByStudentIdAndPillId(studentId, pillId);
    if (!studentProgram && pillId !== introductionID)
      throw new HttpException('Student does not have access to the pill', HttpStatus.FORBIDDEN);
    const pillVersion = await this.pillRepository.getPillVersionByPillIdAndStudentId(pillId, studentId);
    if (!pillVersion) throw new HttpException('Pill version not found', HttpStatus.NOT_FOUND);
    return await this.pillRepository.createPillSubmission(pillVersion.id, studentId);
  }

  private async saveIntroductionProgress(studentDto: StudentDto, answerRequest: AnswerRequestDto) {
    const varName = introductionVariables[answerRequest.questionId];
    if (!varName) return studentDto;
    Object.keys(studentDto).forEach((key) => {
      if (!studentDto[key] || !Object.values(introductionVariables).includes(studentDto[key])) return studentDto;
      studentDto[key] = this.capitalizeAndTrim(studentDto[key]);
    });
    const updatedStudent = await this.studentRepository.updateStudent(studentDto.id, varName, this.capitalizeAndTrim(answerRequest.answer));
    if (!updatedStudent) throw new HttpException('Error while updating student', HttpStatus.INTERNAL_SERVER_ERROR);
    return updatedStudent;
  }

  private capitalizeAndTrim(str) {
    return str.trim().replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
  }

  private replaceFullName(pill: any, fullName: string) {
    return JSON.parse(JSON.stringify(pill).replaceAll('@fullname', fullName));
  }

  private questionAlreadyAnswered(pillAnswers: PillAnswer[], questionId: string) {
    return !!pillAnswers.find((pillAnswer) => pillAnswer.questionId === questionId);
  }
}
