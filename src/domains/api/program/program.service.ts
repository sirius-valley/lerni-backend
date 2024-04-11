import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import { ProgramRequestDto } from './dtos/program-request.dto';
import { PillRepository } from '../pill/pill.repository';
import { QuestionnaireRepository } from '../questionnaire/questionnaire.repository';
import { StudentService } from '../student/student.service';
import { StudentDto } from '../student/dtos/student.dto';
import { StudentRepository } from '../student/student.repository';
import { AuthService } from '../../auth/auth.service';
import { PillRequestDto } from '../pill/dtos/pill-request.dto';
import { QuestionnaireRequestDto } from '../questionnaire/dtos/questionnaire-request.dto';
import { ProgramAdminDetailsDto } from './dtos/program-admin-detail.dto';
import { SimpleStudentDto } from '../student/dtos/simple-student.dto';
import { ProgramStudentsDto } from './dtos/program-students.dto';

@Injectable()
export class ProgramService {
  constructor(
    private programRepository: ProgramRepository,
    private readonly questionnaireRepository: QuestionnaireRepository,
    private readonly pillRepository: PillRepository,
    private readonly studentService: StudentService,
    private readonly studentRepository: StudentRepository,
    private readonly authService: AuthService,
  ) {}

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

  public async getProgramVersionStudents(programVersionId: string) {
    const program = await this.getProgramByProgramVersionId(programVersionId);
    if (!program) throw new HttpException('Program not found', 404);
    const students = await this.programRepository.getStudentsByProgramVersionId(programVersionId);
    const completedStudents = students.filter((student) => student.questionnaireSubmissions.some((qs) => qs.progress === 100));
    return new ProgramStudentsDto({
      programVersionId,
      totalStudents: students.length,
      studentsCompleted: completedStudents.map((student) => new SimpleStudentDto(student)),
    });
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

  public async getProgramVersion(studentId: string, programId: string) {
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

  public async getProgramByProgramVersionId(id: string) {
    return await this.programRepository.getProgramByProgramVersion(id);
  }

  private async addPillToProgram(data: PillRequestDto[], programId: string) {
    const pills = await Promise.all(
      data.map(async (item) => {
        return await this.pillRepository.createPill({
          name: item.name,
          description: item.description,
          teacherComment: item.teacherComment,
        });
      }),
    );
    const pillsVersions = await Promise.all(
      pills.map(async (pill, index) => {
        return await this.pillRepository.createPillVersion(pill.id, data[index].block, data[index].completionTimeMinutes);
      }),
    );
    await Promise.all(
      pillsVersions.map(async (pill, index) => {
        await this.programRepository.createProgramPillVersion(programId, pill.id, index);
      }),
    );
  }

  public async createVersionProgram(programId: string, version: number) {
    return await this.programRepository.createProgramVersion(programId, version);
  }

  public async addQuestionnaireToProgram(programId: string, data: QuestionnaireRequestDto) {
    const questionarie = await this.questionnaireRepository.createQuestionnaire(data.name, data.description);

    const questionnaireVersion = await this.questionnaireRepository.createQuestionnaireVersion(
      questionarie.id,
      data.completionTimeMinutes,
      data.cooldownInMinutes,
      data.block,
      data.questionCount,
      data.passsingScore,
      1,
    );

    await this.programRepository.createProgramQuestionnaireVersion(programId, questionnaireVersion.id, data.order);
  }

  public async enrollStudents(programId: string, newStudents: string[]) {
    const students = await this.studentService.getStudentsByEmail(newStudents);

    Promise.all(
      students.map(async (student) => {
        if (student instanceof StudentDto) {
          await this.studentRepository.enrollStudent(student.id, programId);
        } else {
          const temporalStudent = await this.authService.temporalRegister(student.email);
          await this.studentRepository.enrollStudent(temporalStudent.id, programId);
        }
      }),
    );
  }

  public async createProgram(newProgram: ProgramRequestDto) {
    const program = await this.programRepository.createProgram(
      newProgram.title,
      newProgram.description,
      newProgram.hoursToComplete,
      newProgram.pointsReward,
      newProgram.professor,
      newProgram.image,
    );

    const programVersion = await this.createVersionProgram(program.id, 1);

    await this.addPillToProgram(newProgram.pill, programVersion.id);

    await this.addQuestionnaireToProgram(programVersion.id, newProgram.questionnaire);

    await this.enrollStudents(programVersion.id, newProgram.students);

    return program;
  }

  public async getProgramDetail(id: string) {
    const program = await this.programRepository.getProgramByProgramVersionId(id);
    if (!program) throw new HttpException('Program Version not found', HttpStatus.NOT_FOUND);

    const trivias = program.programVersionTrivias.map((item) => {
      return item.trivia;
    });

    const students = program.studentPrograms.map((item) => {
      return item.student;
    });

    const pills = program.programVersionPillVersions.map((item) => {
      return item.pillVersion.pill;
    });

    const questionaries = program.programVersionQuestionnaireVersions.map((item) => {
      return item.questionnaireVersion.questionnaire;
    });

    return new ProgramAdminDetailsDto({
      id: program.id,
      programName: program.program.name,
      icon: program.program.icon,
      estimatedHours: program.program.hoursToComplete,
      points: program.program.pointsReward,
      pills: pills,
      questionnaire: questionaries,
      students: students,
      teacher: new TeacherDto(program.program.teacher),
      programDescription: program.program.description as string,
      trivias,
    });
  }

  public async getLikesAndDislikes(id: string) {
    const program = await this.programRepository.getProgramByProgramVersion(id);
    if (!program) throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    const likes = await this.programRepository.countLikesByProgramId(id);
    const dislikes = await this.programRepository.countDislikesByProgramId(id);
    return { likes: Number(likes), dislikes: Number(dislikes) };
  }

  public async update(programVersionId: string, data: ProgramRequestDto) {
    //check datos a actualizar
    const program = await this.programRepository.getProgramByProgramVersionId(programVersionId);
    if (!program) throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    console.log(data);
    //actualizar datos
    //return an ok
  }
}
