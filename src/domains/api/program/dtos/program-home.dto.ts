import { SimpleProgramDto } from './simple-program.dto';
import { Program } from '@prisma/client';

export class ProgramHomeDto {
  programsCompleted: SimpleProgramDto[];
  programsInProgress: SimpleProgramDto[];
  programsNotStarted: SimpleProgramDto[];

  constructor(programs: { program: Program; progress: number }[]) {
    this.programsCompleted = programs.filter((p) => p.progress === 100).map((p) => new SimpleProgramDto(p.program, p.progress));
    this.programsInProgress = programs
      .filter((p) => p.progress < 100 && p.progress > 0)
      .map((p) => new SimpleProgramDto(p.program, p.progress));
    this.programsNotStarted = programs.filter((p) => p.progress === 0).map((p) => new SimpleProgramDto(p.program, p.progress));
  }
}
