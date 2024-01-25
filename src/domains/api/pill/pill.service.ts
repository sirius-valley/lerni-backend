import { PillRepository } from './pill.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { PillAnswerSpringDto } from '../pill-external-api/dtos/pill-answer-spring.dto';
import { introductionID, introductionVariables } from '../../../const';
import { PillAnswer } from '@prisma/client';
import { AnswerRequestDto } from './dtos/answer-request.dto';
import { PillProgressResponseDto } from './dtos/pill-progress-response.dto';
import { TeacherDto } from './dtos/teacher.dto';
import { PillDto } from './dtos/pill.dto';
import { StudentRepository } from '../student/student.repository';

@Injectable()
export class PillService {
  constructor(
    private readonly pillRepository: PillRepository,
    private readonly springPillService: SpringPillService,
    private readonly studentRepository: StudentRepository,
  ) {}

  public async getIntroduction(authorization: string, student: StudentDto) {
    const introduction = await this.pillRepository.getPillVersionByPillIdAndStudentId(introductionID, student.id);
    if (!introduction) throw new HttpException('Introduction not found', HttpStatus.NOT_FOUND);
    const answers = introduction.pillSubmissions?.length === 1 ? introduction.pillSubmissions[0].pillAnswers : [];
    const springProgress = await this.springPillService.getSpringProgress(introduction.block, authorization, answers);

    return {
      pill: {
        ...introduction.pill,
        version: introduction.version,
        completionTimeMinutes: introduction.completionTimeMinutes,
        data: this.replaceFullName(springProgress, student.name + ' ' + student.lastname),
      },
      teacher: null,
    };
  }

  public async getPillVersionByPillId(authorization: string, student: StudentDto, pillId: string): Promise<PillProgressResponseDto> {
    const pillVersion = await this.pillRepository.getPillByPillIdAndStudentId(pillId, student.id);
    if (!pillVersion) throw new HttpException('Pill not found', HttpStatus.NOT_FOUND);
    const teacher = await this.pillRepository.getTeacherByPillId(pillId);
    const answers =
      (await this.pillRepository.getPillSubmissionByPillIdAndStudentId(pillId, student.id))?.pillAnswers?.map(
        (answer) => new PillAnswerSpringDto(answer.questionId, answer.value),
      ) || [];
    const springProgress = await this.springPillService.getSpringProgress(pillVersion.block, authorization, answers);
    if (!springProgress) throw new HttpException('Error while calculating progress', HttpStatus.INTERNAL_SERVER_ERROR);
    const replacedPill = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);

    return {
      pill: new PillDto(pillVersion.pill, pillVersion, replacedPill),
      teacher: new TeacherDto(teacher),
    };
  }

  public async answerPill(authorization: string, student: StudentDto, answerRequest: AnswerRequestDto): Promise<PillProgressResponseDto> {
    const pillSubmission = await this.getPillSubmission(answerRequest, student);
    if (this.questionAlreadyAnswered(pillSubmission.pillAnswers, answerRequest.questionId))
      throw new HttpException('Question already answered', HttpStatus.CONFLICT);

    const springProgress = await this.getSpringProgress(authorization, pillSubmission, answerRequest);
    const replacedPill = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);

    await this.pillRepository.createPillAnswer(pillSubmission.id, answerRequest.questionId, answerRequest.answer);
    if (answerRequest.pillId === introductionID) await this.saveIntroductionProgress(student, answerRequest);

    return {
      pill: new PillDto(pillSubmission.pillVersion.pill, pillSubmission.pillVersion, replacedPill),
      teacher: undefined,
    };
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
    if (!studentProgram) throw new HttpException('Student does not have access to the pill', HttpStatus.FORBIDDEN);
    const pillVersion = await this.pillRepository.getPillVersionByPillIdAndStudentId(pillId, studentId);
    return await this.pillRepository.createPillSubmission(pillVersion.id, studentId);
  }

  private async saveIntroductionProgress(studentDto: StudentDto, answerRequest: AnswerRequestDto) {
    const varName = introductionVariables[answerRequest.questionId];
    if (!varName) return;
    if (varName === 'lastname') studentDto.lastname = this.capitalizeAndTrim(answerRequest.answer);
    await this.studentRepository.updateStudent(studentDto.id, varName, this.capitalizeAndTrim(answerRequest.answer));
  }

  private capitalizeAndTrim(str) {
    console.log(str);
    return str.trim().replace(/\b\w/g, (c: string) => c.toUpperCase());
  }

  private replaceFullName(pill: any, fullName: string) {
    return JSON.parse(JSON.stringify(pill).replace('@fullname', fullName));
  }

  private questionAlreadyAnswered(pillAnswers: PillAnswer[], questionId: string) {
    return !!pillAnswers.find((pillAnswer) => pillAnswer.questionId === questionId);
  }
}
