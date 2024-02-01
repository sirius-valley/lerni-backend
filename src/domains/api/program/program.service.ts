import { Injectable } from '@nestjs/common';
import { ProgramRepository } from './program.repository';
import { PillRepository } from '../pill/pill.repository';

@Injectable()
export class ProgramService {
  constructor(
    private programRepository: ProgramRepository,
    private pillRepository: PillRepository,
  ) {}

  public async getProgramById(studentId: string, programId: string) {
    return await this.programRepository.getStudentProgramByStudentIdAndProgramId(studentId, programId);
    // const programVersionPillVersions = await this.pillRepository.getProgramVersionPillVersion(studentId, studentProgram.programVersionId);
    // const pillVersions = programVersionPillVersions.map((pvPillV) => pvPillV.pillVersion);
  }
}
