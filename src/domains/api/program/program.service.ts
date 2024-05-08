import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProgramRepository } from './program.repository';
import { TeacherDto } from '../pill/dtos/teacher.dto';
import { SimplePillDto } from './dtos/simple-pill.dto';
import { SimpleQuestionnaireDto } from './dtos/simple-questionnaire.dto';
import { ProgramDetailsDto } from './dtos/program-details.dto';
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
import { ProgramStudentsDto } from './dtos/program-students.dto';
import { ProgramUpdateRequestDto } from './dtos/program-update.dto';
import { PillUpdateRequestDto } from '../pill/dtos/pill-update.dto';
import { ProgramListDto, ProgramListResponseDto } from './dtos/program-list.dto';
import { ProgramVotesDto } from './dtos/program-votes.dto';
import { TriviaRepository } from '../trivia/trivia.repository';
import { TriviaDetailsWeb } from '../trivia/dto/trivia-details-web.dto';
import { PillDetailsWeb } from '../pill/dtos/pill-details-web.dto';
import { QuestionnaireDetailsWeb } from '../questionnaire/dtos/questionnaire-details-web.dto';
import { AchievementService } from '../achievement/achievement.service';
import { ProgramCardDto } from './dtos/program-card.dto';
import { NotificationService } from '../notification/notification.service';
// eslint-disable-next-line
const cron = require('node-cron');

@Injectable()
export class ProgramService {
  constructor(
    private programRepository: ProgramRepository,
    private readonly questionnaireRepository: QuestionnaireRepository,
    private readonly pillRepository: PillRepository,
    private readonly studentService: StudentService,
    private readonly studentRepository: StudentRepository,
    private readonly authService: AuthService,
    private readonly triviaRepository: TriviaRepository,
    private readonly achievementService: AchievementService,
    private readonly notificationService: NotificationService,
  ) {}

  public async getProgramById(studentId: string, programId: string) {
    const programVersion = await this.getProgramVersion(studentId, programId);
    const leaderBoard = await this.calculateLeaderBoard(
      studentId,
      programVersion.programVersionQuestionnaireVersions[0].questionnaireVersion.questionnaireId,
    );
    return this.createProgramDetailsDto(programVersion, leaderBoard);
  }

  public async getProgramsByStudentId(studentId: string, status: string, options: LimitOffsetPagination) {
    switch (status.toLowerCase()) {
      case 'not_started': {
        const { data, total } = await this.programRepository.getProgramsNotStartedByStudentId(studentId, options);
        const programs = data.map((studentprogram) => new ProgramCardDto(studentprogram.programVersion.program, 0));
        return { programs, maxPage: Math.ceil(total / (options.limit || 10)) };
      }
      case 'in_progress': {
        const { data, total } = await this.programRepository.getStudentProgramsInProgressByStudentId(studentId, options);
        const programs = data.map((studentProgram) => {
          const progress = this.calculateProgress(
            studentProgram.programVersion.programVersionPillVersions,
            studentProgram.programVersion.programVersionQuestionnaireVersions[0],
          );
          return new ProgramCardDto(studentProgram.programVersion.program, progress);
        });
        return { programs, maxPage: Math.ceil(total / (options.limit || 10)) };
      }
      case 'finished': {
        const { data, total } = await this.programRepository.getProgramsCompletedByStudentId(studentId, options);
        const programs = data.map((studentProgram) => new ProgramCardDto(studentProgram.programVersion.program, 100));
        return { programs, maxPage: Math.ceil(total / (options.limit || 10)) };
      }
    }
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
    await this.achievementService.updateProgress(studentProgram.studentId, 'feedback');
  }

  public async getProgramVersionStudents(programVersionId: string) {
    const program = await this.getProgramByProgramVersionId(programVersionId);
    if (!program) throw new HttpException('Program not found', 404);
    const students = await this.programRepository.getStudentsByProgramVersionId(programVersionId);
    const completedStudents = students.filter((student) => student.questionnaireSubmissions.some((qs) => qs.progress === 100));
    const notStartedStudents = students.filter((student) => student.pillSubmissions.length === 0);
    const inProgressStudents = students.filter(
      (student) => student.pillSubmissions.length !== 0 && student.questionnaireSubmissions.every((qs) => qs.progress !== 100),
    );
    return new ProgramStudentsDto({
      programVersionId,
      totalStudents: students.length,
      notStarted: notStartedStudents.length,
      inProgress: inProgressStudents.length,
      completed: completedStudents.length,
    });
  }

  public async getQuestionnaireAttemptsQuantity(programVersionId: string) {
    const program = await this.getProgramByProgramVersionId(programVersionId);
    if (!program) throw new HttpException('Program not found', 404);
    const students = await this.programRepository.getStudentsWithCompletedQuestionnaireByProgramVersionId(programVersionId);
    const questionnaireAttemptQuantity = students.map((student) => student.questionnaireSubmissions.length);
    const frequencyMap = questionnaireAttemptQuantity.reduce((acc, num) => {
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(frequencyMap)
      .map(([x, y]) => ({ attempts: Number.parseInt(x), studentQty: y }))
      .slice(0, 5);
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
      startDate: programVersion.startDate,
      endDate: programVersion.endDate,
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

  public async createVersionProgram(programId: string, version: number, startDate?: Date, endDate?: Date) {
    return await this.programRepository.createProgramVersion(programId, version, startDate, endDate);
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

    await Promise.all(
      students.map(async (student) => {
        if (student instanceof StudentDto) {
          await this.studentRepository.enrollStudent(student.id, programId);
        } else {
          const temporalStudent = await this.authService.temporalRegister(student.email);
          if (!temporalStudent.user?.id) throw new HttpException("Can't enrrol student", HttpStatus.BAD_REQUEST);
          await this.studentRepository.enrollStudent(temporalStudent.user.id, programId);
        }
      }),
    );
  }

  public async addTriviaToProgram(programVersionId: string, trivia: any) {
    const newTrivia = await this.triviaRepository.create(trivia.block, trivia.questionCount);
    const programVersionTrivia = await this.triviaRepository.createTriviaProgram(
      programVersionId,
      newTrivia.id,
      trivia.order ? trivia.order : 1,
    );
    return programVersionTrivia;
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

    const programVersion = await this.createVersionProgram(program.id, 1, newProgram.startDate, newProgram.endDate);

    await this.addPillToProgram(newProgram.pill, programVersion.id);

    await this.addQuestionnaireToProgram(programVersion.id, newProgram.questionnaire);

    await this.enrollStudents(programVersion.id, newProgram.students);

    if (newProgram.startDate || newProgram.endDate) {
      if (newProgram.startDate) {
        cron.schedule(
          `${new Date(newProgram.startDate).getMinutes()} ${new Date(newProgram.startDate).getHours()} ${new Date(
            newProgram.startDate,
          ).getDate()} ${new Date(newProgram.startDate).getMonth() + 1} *`,
          async () => {
            const students = await this.programRepository.getStudentEnrroledByProgramVersionId(programVersion.id);
            students.map((student) => {
              this.notificationService.sendNotification({
                userId: student.id,
                title: 'Nuevo Programa disponible',
                message: `Ahora tenes acceso a ${newProgram.title}! Sigamos aprendiendo!`,
              });
            });
          },
          {
            scheduled: true,
            timezone: 'America/Buenos_Aires',
          },
        );
      }
      if (newProgram.endDate) {
        const endDate = new Date(newProgram.endDate);
        const endDateMinus30Minutes = new Date(endDate.getTime() - 30 * 60000);
        const endDateMinus60Minutes = new Date(endDate.getTime() - 60 * 60000);
        const endDateMinusOneDay = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

        cron.schedule(
          `* ${endDateMinus30Minutes.getMinutes()} ${endDateMinus30Minutes.getHours()} ${endDateMinus30Minutes.getDate()} ${
            endDateMinus30Minutes.getMonth() + 1
          } *`,
          async () => {
            const students = await this.programRepository.getStudentEnrroledByProgramVersionId(programVersion.id);
            students.map((student) => {
              this.notificationService.sendNotification({
                userId: student.id,
                title: 'Se acaba el tiempo!',
                message: `El programa “${newProgram.title}” terminará en 30 minutos. ¿Qué esperas para completarlo?`,
              });
            });
          },
          {
            scheduled: true,
            timezone: 'America/Buenos_Aires',
          },
        );
        cron.schedule(
          `* ${endDateMinus60Minutes.getMinutes()} ${endDateMinus60Minutes.getHours()} ${endDateMinus60Minutes.getDate()} ${
            endDateMinus60Minutes.getMonth() + 1
          } *`,
          async () => {
            const students = await this.programRepository.getStudentEnrroledByProgramVersionId(programVersion.id);
            students.map((student) => {
              this.notificationService.sendNotification({
                userId: student.id,
                title: 'Se acaba el tiempo!',
                message: `El programa “${newProgram.title}” terminará en 1 hora. ¿Qué esperas para completarlo?`,
              });
            });
          },
          {
            scheduled: true,
            timezone: 'America/Buenos_Aires',
          },
        );
        cron.schedule(
          `* ${endDateMinusOneDay.getMinutes()} ${endDateMinusOneDay.getHours()} ${endDateMinusOneDay.getDate()} ${
            endDateMinusOneDay.getMonth() + 1
          } *`,
          async () => {
            const students = await this.programRepository.getStudentEnrroledByProgramVersionId(programVersion.id);
            students.map((student) => {
              this.notificationService.sendNotification({
                userId: student.id,
                title: 'Se acaba el tiempo!',
                message: `El programa “${newProgram.title}” terminará en 1 dia. ¿Qué esperas para completarlo?`,
              });
            });
          },
          {
            scheduled: true,
            timezone: 'America/Buenos_Aires',
          },
        );
      }
    }
    if (newProgram.trivia) {
      await this.addTriviaToProgram(programVersion.id, newProgram.trivia);
    }

    return program;
  }

  public async getProgramDetail(id: string) {
    const program = await this.programRepository.getProgramByProgramVersionId(id);
    if (!program) throw new HttpException('Program Version not found', HttpStatus.NOT_FOUND);

    const trivias = program.programVersionTrivias.map((item) => {
      return new TriviaDetailsWeb(item.trivia);
    });

    const students = program.studentPrograms.map((item) => {
      return new StudentDto({ ...(item.student as StudentDto), email: item.student.auth.email });
    });

    const pills = program.programVersionPillVersions.map((item) => {
      return new PillDetailsWeb(item.pillVersion, item.order);
    });

    const questionaries = program.programVersionQuestionnaireVersions.map((item) => {
      return new QuestionnaireDetailsWeb(item.questionnaireVersion);
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
      startDate: program.startDate,
      endDate: program.endDate,
    });
  }

  public async getLikesAndDislikes(programVersionId: string) {
    const program = await this.getProgramByProgramVersionId(programVersionId);
    if (!program) throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    const likes = await this.programRepository.countLikesByProgramId(program.id);
    const dislikes = await this.programRepository.countDislikesByProgramId(program.id);
    if (likes === 0 && dislikes === 0) return new ProgramVotesDto();
    return new ProgramVotesDto(likes, dislikes);
  }

  public async getProgramList(options: LimitOffsetPagination): Promise<ProgramListResponseDto> {
    const { results, total } = await this.programRepository.getProgramVersionList(options);
    if (results.length === 0) return { results: [], total };
    return {
      results: results.map((item) => {
        return new ProgramListDto(item.program, item.id);
      }),
      total,
    };
  }

  public async update(programVersionId: string, data: ProgramUpdateRequestDto) {
    //check datos a actualizar
    const program = await this.programRepository.getProgramByProgramVersionId(programVersionId);
    if (!program) throw new HttpException('Program not found', HttpStatus.NOT_FOUND);
    let newProgram;
    if (
      !(await this.checkObjs(
        {
          name: data.title,
          description: data.description,
          hoursToComplete: data.hoursToComplete,
          pointsReward: data.pointsReward,
          icon: data.image,
        },
        program.program,
      ))
    ) {
      newProgram = await this.programRepository.updateProgram(
        program.programId,
        data.title,
        data.description,
        data.hoursToComplete,
        data.pointsReward,
        data.image,
      );
    }

    const checkPills = await this.checkArrayObj(
      data.pill,
      program.programVersionPillVersions.map((item) => {
        return new PillUpdateRequestDto({
          id: item.pillVersion.pill.id,
          name: item.pillVersion.pill.name,
          description: item.pillVersion.pill.description,
          version: item.pillVersion.version,
          teacherComment: item.pillVersion.pill.teacherComment,
          completionTimeMinutes: item.pillVersion.completionTimeMinutes,
          block: item.pillVersion.block,
        });
      }),
    );

    if (checkPills.create.length > 0) {
      await this.addPillToProgram(checkPills.create, programVersionId);
    }
    if (checkPills.delete.length > 0) {
      Promise.all(
        checkPills.delete.map(async (pill) => {
          await this.pillRepository.deletePill(pill.id);
        }),
      );
    }

    const checkStudentList = await this.checkArrayObj(
      data.students.map((item) => {
        return { id: item };
      }),
      program.studentPrograms.map((item) => {
        return { id: item.student.auth.email };
      }),
    );

    if (checkStudentList.create.length > 0) {
      this.enrollStudents(
        program.id,
        checkStudentList.create.map((element) => {
          return element.id;
        }),
      );
    }

    if (checkStudentList.delete.length > 0) {
      checkStudentList.delete.map(async (student) => {
        this.programRepository.downStudentProgram(student.id, programVersionId);
      });
    }

    const checkTrivia = await this.checkObjs(data.trivia, program.programVersionTrivias[0].trivia);

    if (checkTrivia) {
      this.triviaRepository.delete(program.programVersionTrivias[0].trivia.id);
      this.triviaRepository.create(data.trivia, 12);
    }

    const checkQuestionarie = await this.checkObjs(
      data.questionnaire,
      program.programVersionQuestionnaireVersions[0].questionnaireVersion.questionnaire,
    );

    if (checkQuestionarie) {
      this.questionnaireRepository.delete(program.programVersionQuestionnaireVersions[0].questionnaireVersion.questionnaire.id);
      this.addQuestionnaireToProgram(program.programId, data.questionnaire);
    }
    return newProgram;
  }

  private async checkObjs(newObj: any, oldObj: any) {
    if (!(newObj && oldObj)) return false;
    const oldKeys = Object.keys(oldObj);

    const result: string[] = [];

    for (const key of oldKeys) {
      try {
        if (newObj[key] !== oldObj[key]) {
          result.push(key);
        }
      } catch {
        continue;
      }
    }
    return result.length === 0 ? true : false;
  }

  private async checkArrayObj(newArray: any[], oldArray: any[]) {
    const result: { value: boolean; update: any[]; create: any[]; delete: any[] } = { value: true, update: [], create: [], delete: [] };

    await Promise.all(
      oldArray.map(async (item, index) => {
        const itemToSearch = newArray.findIndex((find) => find.id === item.id);
        if (itemToSearch === -1) {
          oldArray.splice(index, 1);
          result.value = false;
        } else {
          if (!(await this.checkObjs(item, newArray[itemToSearch]))) {
            result.value = false;
            result.update.push(newArray[index]);
            newArray.splice(index, 1);
            oldArray.splice(index, 1);
          } else {
            oldArray.splice(index, 1);
          }
        }
      }),
    );

    result.delete = oldArray;

    result.create = newArray;

    return result;
  }
}
