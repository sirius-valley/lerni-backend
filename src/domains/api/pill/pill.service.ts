import { PillRepository } from './pill.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PillAnswerSpringDto } from './dtos/pill-answer-spring.dto';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class PillService {
  constructor(
    private readonly pillRepository: PillRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async getPillVersionByPillId(authorization: string, student: StudentDto, pillId: string) {
    const pill = await this.pillRepository.getPillByPillIdAndStudentId(pillId, student.id);
    if (!pill) throw new HttpException('Pill not found', HttpStatus.NOT_FOUND);
    const teacher = await this.pillRepository.getTeacherByPillId(pillId);
    const answers =
      (await this.pillRepository.getPillSubmissionByPillIdAndStudentId(pillId, student.id))?.pillAnswers?.map(
        (answer) => new PillAnswerSpringDto(answer.questionId, answer.value),
      ) || [];
    const springProgress = await this.getSpringProgress(pill.block, authorization, answers);
    if (!springProgress) throw new HttpException('Error while calculating progress', HttpStatus.INTERNAL_SERVER_ERROR);

    return {
      pill: springProgress,
      teacher,
    };
  }

  private async getSpringProgress(pillBlock: any, authorization: string, answers: PillAnswerSpringDto[]) {
    const springProgress = await firstValueFrom(
      this.httpService
        .get(this.configService.get<string>('SPRING_SERVICE_URL') + '/pill/progress', {
          headers: {
            Authorization: authorization,
          },
          data: {
            answers: answers,
            pillForm: JSON.parse(pillBlock),
          },
        })
        .pipe(
          catchError((err) => {
            throw new HttpException('Error while calculating progress: ' + err, HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
    );
    return springProgress.data;
  }
}
