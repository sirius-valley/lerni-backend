import { PillRepository } from './pill.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { PillAnswerSpringDto } from '../pill-external-api/dtos/pill-answer-spring.dto';
import { introductionID, introductionTeacher, introductionVariables } from '../../../const';
import { PillAnswer } from '@prisma/client';
import { AnswerRequestDto } from './dtos/answer-request.dto';
import { PillProgressResponseDto } from './dtos/pill-progress-response.dto';
import { TeacherDto } from './dtos/teacher.dto';
import { PillDto } from './dtos/pill.dto';
import { StudentRepository } from '../student/student.repository';
import { HeadlandsAdapter } from './adapters/headlands.adapter';
import { PillBlockDto } from './dtos/pill-block.dto';
import { ThreadRequestDto } from './dtos/thread-request.dto';
import { AchievementService } from '../achievement/achievement.service';
import { Field, OpenAIService } from './openai.client';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

@Injectable()
export class PillService {
  constructor(
    private readonly pillRepository: PillRepository,
    private readonly springPillService: SpringPillService,
    private readonly studentRepository: StudentRepository,
    private readonly headlandsAdapter: HeadlandsAdapter,
    private readonly achievementService: AchievementService,
    private readonly openAIService: OpenAIService,
  ) {}

  public async getIntroduction(authorization: string, student: StudentDto) {
    const introduction = await this.pillRepository.getPillVersionByPillIdAndStudentId(introductionID, student.id);
    if (!introduction) throw new HttpException('Introduction not found', HttpStatus.NOT_FOUND);
    const answers = introduction.pillSubmissions?.length === 1 ? introduction.pillSubmissions[0].pillAnswers : [];
    const answerDtos = this.formatIntroductionAnswers(answers);
    const springProgress = await this.springPillService.getSpringProgress(introduction.block, authorization, answerDtos);
    const replacedPill = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);
    const formattedPillBlock = this.formatIntroductionPillBlock(replacedPill, answers);

    return {
      pill: new PillDto(introduction.pill, introduction, 1, formattedPillBlock),
      teacher: introductionTeacher,
    };
  }

  public async getPillVersionByPillId(authorization: string, student: StudentDto, pillId: string): Promise<PillProgressResponseDto> {
    const pillSubmission = await this.getPillSubmission(pillId, student);
    const teacher = await this.getPillTeacher(pillId);
    const answers = pillSubmission.pillAnswers?.map((answer) => new PillAnswerSpringDto(answer.questionId, JSON.parse(answer.value)));
    const springProgress = await this.springPillService.getSpringProgress(pillSubmission.pillVersion.block, authorization, answers);
    if (!springProgress) throw new HttpException('Error while calculating progress', HttpStatus.INTERNAL_SERVER_ERROR);
    const replacedPill = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);
    const formattedPillBlock = this.formatPillBlock(replacedPill, JSON.parse(pillSubmission.pillVersion.block));
    const pillOrder = pillSubmission.pillVersion.programVersions[0].order;
    await this.pillRepository.updatePillSubmissionProgress(pillSubmission.id, formattedPillBlock.progress);
    return {
      pill: new PillDto(pillSubmission.pillVersion.pill, pillSubmission.pillVersion, pillOrder, formattedPillBlock),
      teacher: new TeacherDto(teacher),
    };
  }

  public async answerPill(authorization: string, student: StudentDto, answerRequest: AnswerRequestDto): Promise<PillProgressResponseDto> {
    if (answerRequest.pillId === introductionID) return await this.answerIntroduction(authorization, student, answerRequest);
    return await this.answerRegularPill(authorization, student, answerRequest);
  }

  private async answerRegularPill(
    authorization: string,
    student: StudentDto,
    answerRequest: AnswerRequestDto,
  ): Promise<PillProgressResponseDto> {
    const pillSubmission = await this.getPillSubmission(answerRequest.pillId, student);
    if (this.questionAlreadyAnswered(pillSubmission.pillAnswers, answerRequest.questionId))
      throw new HttpException('Question already answered', HttpStatus.CONFLICT);

    const teacher = await this.getPillTeacher(answerRequest.pillId);

    const springProgress = await this.getSpringProgress(authorization, pillSubmission, answerRequest);

    const replacedPill = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);
    const formattedPillBlock = this.formatPillBlock(replacedPill, JSON.parse(pillSubmission.pillVersion.block));
    await this.pillRepository.createPillAnswer(
      pillSubmission.id,
      answerRequest.questionId,
      JSON.stringify(answerRequest.answer),
      formattedPillBlock.progress,
    );

    const teacherDto = this.getTeacher(answerRequest, teacher);
    const pillOrder = answerRequest.pillId === introductionID ? 1 : pillSubmission.pillVersion.programVersions[0].order;

    return {
      pill: new PillDto(pillSubmission.pillVersion.pill, pillSubmission.pillVersion, pillOrder, formattedPillBlock),
      teacher: answerRequest.pillId === introductionID ? introductionTeacher : teacherDto,
    };
  }

  private async answerIntroduction(
    authorization: string,
    student: StudentDto,
    answerRequest: AnswerRequestDto,
  ): Promise<PillProgressResponseDto> {
    const pillSubmission = await this.getPillSubmission(answerRequest.pillId, student);

    answerRequest = this.formatIntroductionAnswer(answerRequest);
    const varName = introductionVariables[answerRequest.questionId];
    const answer = varName ? await this.checkIntroductionAnswer(student, answerRequest, varName) : { student, answerRequest };
    const springAnswer = this.formatSpringAnswerRequest(answer.answerRequest);
    const springProgress = await this.springPillService.answerPill(authorization, pillSubmission.pillVersion.block, springAnswer);
    if (springProgress.completed) {
      this.studentRepository.addPoints(student.id, 5, introductionID, 'introduction');
      this.achievementService.updateProgress(student.id, 'introduction');
    }
    const replacedPill = this.replaceFullName(springProgress, answer.student.name + ' ' + answer.student.lastname);
    const formattedPillBlock = this.formatIntroductionPillBlock(replacedPill, []);
    await this.pillRepository.createPillAnswer(
      pillSubmission.id,
      answerRequest.questionId,
      answer.answerRequest.answer,
      formattedPillBlock.progress,
    );

    return {
      pill: new PillDto(pillSubmission.pillVersion.pill, pillSubmission.pillVersion, 1, formattedPillBlock),
      teacher: new TeacherDto(introductionTeacher),
    };
  }

  private formatIntroductionAnswer(answerRequest: AnswerRequestDto) {
    const answer = { value: answerRequest.answer, detected: true };
    return {
      ...answerRequest,
      questionId: answerRequest.questionId.slice(0, 36),
      answer: JSON.stringify(answer),
    };
  }

  private async checkIntroductionAnswer(studentDto: StudentDto, answerRequest: AnswerRequestDto, varName: string) {
    const answerJson = JSON.parse(answerRequest.answer.toString());
    const response = await this.getResponse(answerJson.value, varName);
    const student = response !== 'Undetected' ? await this.saveIntroductionProgress(studentDto, response, varName) : studentDto;
    const answer = { value: answerJson.value, detected: response !== 'Undetected' };
    return {
      student,
      answerRequest: new AnswerRequestDto(answerRequest.pillId, answerRequest.questionId, JSON.stringify(answer)),
    };
  }

  private async getResponse(answer: string, varName: string) {
    if (varName === 'image') return answer;
    return await this.openAIService.retrieveData(answer, varName as Field);
  }

  private formatSpringAnswerRequest(answerRequest: AnswerRequestDto) {
    const answerJson = JSON.parse(answerRequest.answer.toString());
    const answer = answerJson.detected ? answerJson.value : 'Error';
    return new PillAnswerSpringDto(answerRequest.questionId, answer);
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
      progress: !springProgress.completed && springProgress.progress === 100 ? 95 : springProgress.progress,
      bubbles: this.mergeData(springProgress, pillBlock),
    };
  }

  private formatIntroductionPillBlock(springProgress: any, answers: any) {
    return {
      completed: springProgress.completed,
      progress: !springProgress.completed && springProgress.progress === 100 ? 95 : springProgress.progress,
      bubbles: this.mergeIntroductionData(springProgress, answers.reverse()),
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
          optionDescriptions: node.nodeContent.metadata.metadata.option_descriptions,
        };
    }
  }

  private mergeIntroductionData(springProgress: any, answers: any) {
    return springProgress.nodes.map((node) => {
      const type = node.nodeContent?.metadata?.metadata.lerni_question_type ?? 'text';
      const answer = type != 'text' && type != 'image' && answers.length !== 0 ? JSON.parse(answers.pop().value) : {};
      return {
        id: node.nodeId + randomStringGenerator(),
        type: type,
        ...this.calculateExtraAttributesIntroduction(node, type, answer),
      };
    });
  }

  private calculateExtraAttributesIntroduction(node: any, type: string, answer: any) {
    switch (type) {
      case 'text':
      case 'image':
        return { content: node.nodeContent.content };
      case 'free-text':
        return { content: answer.value ?? '' };
      case 'single-choice':
      case 'multiple-choice':
        return { value: answer.value ?? '', options: node.nodeContent.metadata.options };
      case 'carousel':
        return {
          value: answer.answer ?? '',
          options: node.nodeContent.metadata.options,
          optionDescriptions: node.nodeContent.metadata.metadata.option_descriptions,
        };
    }
  }

  private async getSpringProgress(authorization: string, pillSubmission: any, answerRequest: AnswerRequestDto) {
    const springDto = new PillAnswerSpringDto(answerRequest.questionId, answerRequest.answer);
    return await this.springPillService.answerPill(authorization, pillSubmission.pillVersion.block, springDto);
  }

  private async getPillSubmission(pillId: string, student: StudentDto) {
    const pillSubmission = await this.pillRepository.getPillSubmissionByPillIdAndStudentId(pillId, student.id);
    if (pillSubmission) return pillSubmission;
    return await this.createPillSubmission(pillId, student.id);
  }

  private async createPillSubmission(pillId: string, studentId: string) {
    const studentProgram = await this.pillRepository.getStudentProgramByStudentIdAndPillId(studentId, pillId);
    if (!studentProgram && pillId !== introductionID)
      throw new HttpException('Student does not have access to the pill', HttpStatus.FORBIDDEN);
    const pillVersion = await this.pillRepository.getPillVersionByPillIdAndStudentId(pillId, studentId);
    if (!pillVersion) throw new HttpException('Pill version not found', HttpStatus.NOT_FOUND);
    return await this.pillRepository.createPillSubmission(pillVersion.id, studentId);
  }

  private async saveIntroductionProgress(studentDto: StudentDto, answer: string, varName: string) {
    if (answer === 'Error') return studentDto;
    Object.keys(studentDto).forEach((key) => {
      if (!studentDto[key] || !Object.values(introductionVariables).includes(studentDto[key])) return studentDto;
      studentDto[key] = this.capitalizeAndTrim(studentDto[key]);
    });
    const studentData = this.getStudentUpdatedData(answer, varName);
    const updatedStudent = await this.studentRepository.updateStudent(studentDto.id, studentData);
    if (!updatedStudent) throw new HttpException('Error while updating student', HttpStatus.INTERNAL_SERVER_ERROR);
    return updatedStudent;
  }

  private async retrieveData(answer: string, varName: Field) {
    if (varName === 'image') return answer.trim();
    return await this.openAIService.retrieveData(answer, varName);
  }

  private getStudentUpdatedData(answer: string, varName: string) {
    if (varName === 'name') {
      const separatedName = answer.split(', ');
      return {
        name: this.capitalizeAndTrim(separatedName[0]),
        lastname: this.capitalizeAndTrim(separatedName[1] ?? ''),
      };
    }
    return {
      [varName]: answer,
    };
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

  private formatIntroductionAnswers(answers: any) {
    return answers.map((answer) => {
      const value = JSON.parse(answer.value);
      return new PillAnswerSpringDto(answer.questionId, value.detected ? value.value : 'Error');
    });
  }

  private async getPillTeacher(pillId: string) {
    if (pillId === introductionID) return introductionTeacher;
    const pillTeacher = await this.pillRepository.getPillTeacherByPillId(pillId);
    if (pillTeacher) return pillTeacher;
    const programTeacher = await this.pillRepository.getProgramTeacherByPillId(pillId);
    if (!programTeacher) throw new HttpException('Teacher not found', 404);
    return programTeacher;
  }
}
