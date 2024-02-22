import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { PillAnswerSpringDto } from './dtos/pill-answer-spring.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SpringPillService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async getSpringProgress(pillBlock: any, authorization: string, answers: PillAnswerSpringDto[]) {
    console.log(pillBlock);
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

  public async answerPill(authorization: string, pillBlock: any, answerRequest: PillAnswerSpringDto) {
    const springProgress = await firstValueFrom(
      this.httpService
        .post(
          this.configService.get<string>('SPRING_SERVICE_URL') + '/pill/answer',
          {
            answer: answerRequest,
            pillForm: JSON.parse(pillBlock),
          },
          { headers: { Authorization: authorization } },
        )
        .pipe(
          catchError((err) => {
            throw new HttpException(
              'Error while calculating progress: ' + err?.response?.data,
              err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );
    return springProgress.data;
  }

  public async answerQuestionnaire(authorization: string, pillBlock: any, answerRequest: PillAnswerSpringDto) {
    const springProgress = await firstValueFrom(
      this.httpService
        .post(
          this.configService.get<string>('SPRING_SERVICE_URL') + '/questionnaire/answer',
          {
            answer: answerRequest,
            pillForm: JSON.parse(pillBlock),
          },
          { headers: { Authorization: authorization } },
        )
        .pipe(
          catchError((err) => {
            throw new HttpException(
              'Error while calculating progress: ' + err?.response?.data,
              err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );
    return springProgress.data;
  }
}
