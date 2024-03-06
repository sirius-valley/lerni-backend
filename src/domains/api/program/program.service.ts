import { HttpException, Injectable } from '@nestjs/common';
import { ProgramRepository } from './program.repository';
import { TeacherDto } from '../pill/dtos/teacher.dto';
import { SimplePillDto } from './dtos/simple-pill.dto';
import { SimpleQuestionnaireDto } from './dtos/simple-questionnaire.dto';
import { ProgramDetailsDto } from './dtos/program-details.dto';
import { ProgramHomeDto } from './dtos/program-home.dto';
import { CursorPagination } from '../../../types/cursor-pagination.interface';
import { CommentDto } from './dtos/comment.dto';
import { CommentRequestDto } from './dtos/comment-request.dto';
import { ProgramLeaderboardDto } from './dtos/program-leaderboard.dto';
import { LeaderboardItemDto } from './dtos/leaderboard-item.dto';
import { LimitOffsetPagination } from '../../../types/limit-offset.pagination';

@Injectable()
export class ProgramService {
  constructor(private programRepository: ProgramRepository) {}

  public async getProgramById(studentId: string, programId: string) {
    const programVersion = await this.getProgramVersion(studentId, programId);
    const leaderBoard = await this.calculateLeaderBoard(
      studentId,
      programVersion.programVersionQuestionnaireVersions[0].questionnaireVersion.questionnaireId,
    );
    return this.createProgramDetailsDto(programVersion, leaderBoard);
  }

  public async getProgramsByStudentId(studentId: string) {
    const programsCompleted = await this.programRepository
      .getProgramsCompletedByStudentId(studentId)
      .then((result) => result.map((studentProgram) => studentProgram.programVersion.program));
    const inProgress = await this.programRepository.getStudentProgramsInProgressByStudentId(studentId);
    const programsInProgress = inProgress.map((studentProgram) => {
      const progress = this.calculateProgress(
        studentProgram.programVersion.programVersionPillVersions,
        studentProgram.programVersion.programVersionQuestionnaireVersions[0],
      );
      return { program: studentProgram.programVersion.program, progress };
    });
    const programsNotStarted = await this.programRepository
      .getProgramsNotStartedByStudentId(studentId)
      .then((result) => result.map((studentProgram) => studentProgram.programVersion.program));
    const programs = { programsCompleted, programsInProgress, programsNotStarted };

    return new ProgramHomeDto(programs);
  }

  public async getProgramComments(studentId: string, programId: string, options: CursorPagination) {
    const studentProgram = await this.programRepository.getStudentProgramByStudentIdAndProgramId(studentId, programId);
    if (!studentProgram) throw new HttpException('Program not found', 404);
    const comments = await this.programRepository.getProgramPublicComments(programId, options);
    return comments.map((comment) => new CommentDto(comment)).reverse();
  }

  public async createProgramComment(studentId: string, commentRequest: CommentRequestDto) {
    const studentProgram = await this.programRepository.getStudentProgramByStudentIdAndProgramIdWithSubmissions(
      studentId,
      commentRequest.programId,
    );
    if (!studentProgram) throw new HttpException('Program not found', 404);
    if (!this.programIsComplete(studentProgram)) throw new HttpException('Program not complete', 400);
    await this.programRepository.createProgramComment(studentId, commentRequest);
  }

  private programIsComplete(studentProgram: any) {
    return (
      studentProgram.programVersion.programVersionQuestionnaireVersions[0]?.questionnaireVersion.questionnaireSubmissions[0]?.progress ===
      100
    );
  }

  public async getLeaderBoard(studentId: string, programId: string, options: LimitOffsetPagination) {
    const studentProgram = await this.programRepository.getStudentProgramByStudentIdAndProgramIdWithQuestionnaire(studentId, programId);
    if (!studentProgram) throw new HttpException('Program not found', 404);
    const leaderboard: any = await this.programRepository.getPageableLeaderBoardByQuestionnaireId(
      studentProgram.programVersion.programVersionQuestionnaireVersions[0].questionnaireVersion.questionnaireId,
      options,
    );
    return this.formatLeaderBoard(leaderboard);
  }

  private async calculateLeaderBoard(studentId: string, questionnaireId: string) {
    const leaderboard: any = await this.programRepository.getLeaderBoardByQuestionnaireId(questionnaireId, studentId);
    const formattedLeaderboard = this.formatLeaderBoard(leaderboard);
    const studentPosition = formattedLeaderboard.findIndex((student: any) => student.studentId === studentId);
    if (studentPosition < 3) return new ProgramLeaderboardDto(formattedLeaderboard, []);
    return new ProgramLeaderboardDto(
      formattedLeaderboard.slice(0, 1),
      formattedLeaderboard.slice(studentPosition - 1, studentPosition + 2),
    );
  }

  private formatLeaderBoard(leaderboard: any[]): LeaderboardItemDto[] {
    return leaderboard.map((item: any) => {
      return {
        id: item.pointId,
        studentId: item.studentId,
        profileImage: item.image,
        rank: Number(item.pos),
        fullName: item.name + ' ' + item.lastname,
        points: item.amount,
      };
    });
  }

  private async getProgramVersion(studentId: string, programId: string) {
    const studentRelatedProgramVersion = (
      await this.programRepository.getStudentProgramByStudentIdAndProgramIdWithSubmissions(studentId, programId)
    )?.programVersion;
    if (studentRelatedProgramVersion) return studentRelatedProgramVersion;
    const lastProgramVersion = await this.programRepository.getLastProgramVersionWithSubmissions(studentId, programId);
    if (lastProgramVersion) return lastProgramVersion;
    throw new HttpException('Program not found', 404);
  }

  private createProgramDetailsDto(programVersion: any, leaderBoard: ProgramLeaderboardDto) {
    const {
      program,
      programVersionPillVersions: pillVersions,
      programVersionQuestionnaireVersions: questionnaireVersions,
    } = programVersion;

    const pills = this.calculateSimplePillDtos(pillVersions);

    return new ProgramDetailsDto({
      id: program.id,
      programName: program.name,
      teacher: new TeacherDto(program.teacher),
      progress: this.calculateProgress(pillVersions, questionnaireVersions[0]),
      pillCount: pillVersions.length,
      icon: program.icon,
      estimatedHours: program.hoursToComplete,
      points: program.pointsReward,
      programDescription: program.description ?? '',
      pills: pills,
      questionnaire: this.calculateSimpleQuestionnairesDtos(
        questionnaireVersions,
        pills.every((p: any) => p.pillProgress === 100),
      ),
      leaderBoard: leaderBoard,
    });
  }

  private calculateProgress(pillVersions: any, questionnaireVersion: any) {
    const totalPillProgress = pillVersions.reduce(
      (acc: number, pvPillV: any) => acc + (pvPillV.pillVersion.pillSubmissions[0]?.progress || 0),
      0,
    );
    return (
      (totalPillProgress + (questionnaireVersion.questionnaireVersion.questionnaireSubmissions[0]?.progress || 0)) /
      (pillVersions.length + 1)
    );
  }

  private calculateSimpleQuestionnairesDtos(questionnaireVersions: any, pillsCompleted: boolean) {
    return questionnaireVersions.map((qvQuestionnaireV: any, index: any) => {
      if (index === 0) {
        const hasPassedCoolDown = this.hasPassedCoolDown(qvQuestionnaireV);
        return new SimpleQuestionnaireDto(
          qvQuestionnaireV.questionnaireVersion.questionnaire,
          qvQuestionnaireV.questionnaireVersion.completionTimeMinutes,
          qvQuestionnaireV.questionnaireVersion.questionnaireSubmissions[0]?.progress || 0,
          !pillsCompleted || !hasPassedCoolDown.passedCoolDown,
          !hasPassedCoolDown.passedCoolDown ? hasPassedCoolDown.coolDownPassDate : undefined,
        );
      }
      const previousElement = questionnaireVersions[index - 1].questionnaireVersion.questionnaireSubmissions[0];
      const previousProgress = previousElement?.progress;
      const isPreviousQuestionnaireCompleted = previousProgress === 100;
      const hasPassedCoolDown = this.hasPassedCoolDown(qvQuestionnaireV);
      return new SimpleQuestionnaireDto(
        qvQuestionnaireV.questionnaireVersion.questionnaire,
        qvQuestionnaireV.questionnaireVersion.completionTimeMinutes,
        qvQuestionnaireV.questionnaireVersion.questionnaireSubmissions[0]?.progress || 0,
        !pillsCompleted || !isPreviousQuestionnaireCompleted || !hasPassedCoolDown.passedCoolDown,
        !hasPassedCoolDown.passedCoolDown ? hasPassedCoolDown.coolDownPassDate : undefined,
      );
    })[0];
  }

  private calculateSimplePillDtos(pillVersions: any) {
    return pillVersions.map((pvPillV: any, index: any) => {
      const previousProgress = index > 0 ? pillVersions[index - 1].pillVersion.pillSubmissions[0]?.progress : 100;
      const isPreviousPillCompleted = previousProgress === 100;
      return new SimplePillDto(
        pvPillV.pillVersion.pill,
        pvPillV.pillVersion.completionTimeMinutes,
        pvPillV.pillVersion.pillSubmissions[0]?.progress || 0,
        !isPreviousPillCompleted,
      );
    });
  }

  private hasPassedCoolDown(qvQuestionnaireV: any) {
    const lastSubmission = qvQuestionnaireV.questionnaireVersion.questionnaireSubmissions[0];
    if (!lastSubmission) return { passedCoolDown: true, coolDownPassDate: undefined };
    if (lastSubmission.progress === 100) return { passedCoolDown: true, coolDownPassDate: undefined };
    const lastSubmissionDate = new Date(lastSubmission.finishedDateTime);
    const coolDown = qvQuestionnaireV.questionnaireVersion.cooldownInMinutes;
    const now = new Date();
    const passedCoolDown = now.getTime() - lastSubmissionDate.getTime() > coolDown * 60 * 1000;
    const coolDownPassDate = new Date(lastSubmissionDate.getTime() + coolDown * 60 * 1000);
    return { passedCoolDown, coolDownPassDate };
  }
}
