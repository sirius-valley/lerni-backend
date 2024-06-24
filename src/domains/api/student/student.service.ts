import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

    if (!this.checkNecessaryFields(studentDto, necessaryFields) || !this.checkOptionalFields(studentDto, optionalFields))
      return new StudentDetailsDto(studentDto, { hasCompletedIntroduction: false, points: 0, ranking: 0 });
    const introductionCompletion = await this.studentRepository.findIntroductionPillSubmissionByStudentId(studentDto.id);
    if (!this.checkIntroductionPillSubmission(introductionCompletion))
      return new StudentDetailsDto(studentDto, { hasCompletedIntroduction: false, points: studentDto.pointCount, ranking: 0 });
    const ranking = await this.leaderboardService.getStudentRankingById(studentDto.id);
    return new StudentDetailsDto(studentDto, { hasCompletedIntroduction: true, points: studentDto.pointCount, ranking: Number(ranking) });
  }

  private checkNecessaryFields(studentDto: StudentDto, necessaryFields: string[]) {
    return necessaryFields.every((field) => studentDto[field] !== null);
  }

  private checkOptionalFields(studentDto: StudentDto, optionalFields: string[]) {
    return optionalFields.some((field) => studentDto[field] !== null);
  }

  private checkIntroductionPillSubmission(introductionSubmission?: any) {
    if (!introductionSubmission) return false;
    return introductionSubmission.progress === 100;
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

  public async getRegisteredStudents() {
    const registeredStudents = await this.studentRepository.getRegisteredStudents();
    return { registeredStudents };
  }

  public async getStudentProfile(student: StudentDto, studentId?: string) {
    if (!studentId) return this.getStudentDetails(student);
    const otherStudent = await this.studentRepository.findStudentByIdSelectStudentDto(studentId);
    if (!otherStudent) throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    const ranking = await this.leaderboardService.getStudentRankingById(studentId);
    return new StudentDetailsDto(otherStudent, {
      hasCompletedIntroduction: true,
      points: otherStudent.pointCount,
      ranking: Number(ranking),
    });
  }

  public async deleteAccount(studentDto: StudentDto) {
    if (!studentDto.id) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    await this.studentRepository.updateStudentToDeleteByStudentId(studentDto.id);
  }
}
