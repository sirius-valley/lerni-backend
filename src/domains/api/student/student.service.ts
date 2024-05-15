import { Injectable } from '@nestjs/common';
import { StudentDto } from './dtos/student.dto';
import { StudentDetailsDto } from './dtos/student-details.dto';
import { necessaryFields, optionalFields } from '../../../const';
import { StudentRepository } from './student.repository';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  public async getStudentDetails(studentDto: StudentDto) {
    if (!studentDto) return new StudentDetailsDto(studentDto, { hasCompletedIntroduction: false, points: 0, ranking: 0 });

    if (!this.checkNecessaryFields(studentDto, necessaryFields))
      return new StudentDetailsDto(studentDto, { hasCompletedIntroduction: false, points: 0, ranking: 0 });
    if (!this.checkOptionalFields(studentDto, optionalFields))
      return new StudentDetailsDto(studentDto, { hasCompletedIntroduction: false, points: 0, ranking: 0 });
    const points = await this.studentRepository.getTotalPoints(studentDto.id);
    const ranking = await this.leaderboardService.getStudentRankingById(studentDto.id);
    return new StudentDetailsDto(studentDto, { hasCompletedIntroduction: true, points: points, ranking: Number(ranking) });
  }

  private checkNecessaryFields(studentDto: StudentDto, necessaryFields: string[]) {
    return necessaryFields.every((field) => studentDto[field]);
  }

  private checkOptionalFields(studentDto: StudentDto, optionalFields: string[]) {
    return optionalFields.some((field) => studentDto[field]);
  }

  public async getStudentsByEmail(emails: string[]) {
    return await Promise.all(
      emails.map(async (email) => {
        return await this.studentRepository.findStudentByEmail(email);
      }),
    );
  }

  public async getStudentById(id: string) {
    return await this.studentRepository.findStudentById(id);
  }

  public addPoints(studentId: string, amount: number, entityId: string, sourceEntity: string) {
    return this.studentRepository.addPoints(studentId, amount, entityId, sourceEntity);
  }
}
