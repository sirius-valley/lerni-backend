import { PillRepository } from './pill.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { PillAnswerSpringDto } from '../pill-external-api/dtos/pill-answer-spring.dto';
import { introductionID } from '../../../const';

@Injectable()
export class PillService {
  constructor(
    private readonly pillRepository: PillRepository,
    private readonly springPillService: SpringPillService,
  ) {}

  public async getIntroduction(authorization: string, student: StudentDto) {
    const introduction = await this.pillRepository.getById(introductionID, student.id);
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

  public async getPillVersionByPillId(authorization: string, student: StudentDto, pillId: string) {
    const pill = await this.pillRepository.getPillByPillIdAndStudentId(pillId, student.id);
    if (!pill) throw new HttpException('Pill not found', HttpStatus.NOT_FOUND);
    const teacher = await this.pillRepository.getTeacherByPillId(pillId);
    const answers =
      (await this.pillRepository.getPillSubmissionByPillIdAndStudentId(pillId, student.id))?.pillAnswers?.map(
        (answer) => new PillAnswerSpringDto(answer.questionId, answer.value),
      ) || [];
    const springProgress = await this.springPillService.getSpringProgress(pill.block, authorization, answers);
    if (!springProgress) throw new HttpException('Error while calculating progress', HttpStatus.INTERNAL_SERVER_ERROR);
    const replacedPill = this.replaceFullName(springProgress, student.name + ' ' + student.lastname);

    return {
      pill: {
        ...pill.pill,
        version: pill.version,
        completionTimeMinutes: pill.completionTimeMinutes,
        data: replacedPill,
      },
      teacher,
    };
  }

  private replaceFullName(pill: any, fullName: string) {
    return JSON.parse(JSON.stringify(pill).replace('@fullname', fullName));
  }
}
