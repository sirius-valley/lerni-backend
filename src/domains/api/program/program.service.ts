import { HttpException, Injectable } from '@nestjs/common';
import { ProgramRepository } from './program.repository';
import { PillRepository } from '../pill/pill.repository';
import { ProgramDetailsDto } from './dtos/program-details.dto';
import { GetFindResult } from 'prisma/prisma-client/runtime/library';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { ProgramHomeDto } from './dtos/program-home.dto';

@Injectable()
export class ProgramService {
  constructor(
    private programRepository: ProgramRepository,
    private pillRepository: PillRepository,
  ) {}

  public async getProgramById(studentId: string, programId: string) {
    const programVersion = await this.getProgramVersion(studentId, programId);
    const programVersionPillVersions = await this.pillRepository.getProgramVersionPillVersion(studentId, programVersion.id);
    const pillVersions = this.getPillVersions(programVersionPillVersions);
    return new ProgramDetailsDto(programVersion.objectives, programVersion.program, pillVersions);
  }

  public async getProgramsByStudentId(studentId: string) {
    const programsCompleted = await this.programRepository
      .getProgramsCompletedByStudentId(studentId)
      .then((result) => result.map((studentProgram) => studentProgram.programVersion.program));
    const inProgress = await this.programRepository.getStudentProgramsInProgressByStudentId(studentId);
    const programsInProgress = inProgress.map((studentProgram) => {
      const progress =
        studentProgram.programVersion.programVersionPillVersions.reduce(
          (acc, pvPillV) => acc + (pvPillV.pillVersion.pillSubmissions[0]?.progress || 0),
          0,
        ) / studentProgram.programVersion.programVersionPillVersions.length;
      return { program: studentProgram.programVersion.program, progress };
    });
    const programsNotStarted = await this.programRepository
      .getProgramsNotStartedByStudentId(studentId)
      .then((result) => result.map((studentProgram) => studentProgram.programVersion.program));
    const programs = { programsCompleted, programsInProgress, programsNotStarted };

    return new ProgramHomeDto(programs);
  }

  private async getProgramVersion(studentId: string, programId: string) {
    const studentRelatedProgramVersion = (await this.programRepository.getStudentProgramByStudentIdAndProgramId(studentId, programId))
      ?.programVersion;
    if (studentRelatedProgramVersion) return studentRelatedProgramVersion;
    const lastProgramVersion = await this.programRepository.getLastProgramVersion(programId);
    if (lastProgramVersion) return lastProgramVersion;
    throw new HttpException('Program not found', 404);
  }

  private getPillVersions(
    programVersionPillVersions: GetFindResult<
      Prisma.$ProgramVersionPillVersionPayload<DefaultArgs>,
      {
        include: {
          pillVersion: {
            include: {
              pillSubmissions: { take: number; orderBy: { createdAt: string }; where: { studentId: string } };
              pill: boolean;
            };
          };
        };
        where: { programVersionId: string };
      }
    >[],
  ) {
    return programVersionPillVersions.map((pvPillV) => {
      return {
        pv: pvPillV.pillVersion,
        order: pvPillV.order,
      };
    });
  }
}
