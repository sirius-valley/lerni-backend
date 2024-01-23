import { PillRepository } from './pill.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SpringPillService } from '../pill-external-api/spring-pill.service';
import { PillAnswerSpringDto } from '../pill-external-api/dtos/pill-answer-spring.dto';

@Injectable()
export class PillService {
  constructor(
    private readonly pillRepository: PillRepository,
    private readonly springPillService: SpringPillService,
  ) {}

  public async getIntroduction(authorization: string, student: StudentDto) {}

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
