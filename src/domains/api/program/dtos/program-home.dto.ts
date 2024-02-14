import { SimpleProgramDto } from './simple-program.dto';
import { Program } from '@prisma/client';

export class ProgramHomeDto {
  programsCompleted: SimpleProgramDto[];
  programsInProgress: SimpleProgramDto[];
  programsNotStarted: SimpleProgramDto[];

  constructor(programs: {
    programsCompleted: Program[];
    programsInProgress: { program: Program; progress: number }[];
    programsNotStarted: Program[];
  }) {
    this.programsCompleted = programs.programsCompleted.map((program) => new SimpleProgramDto(program, 100));
    this.programsInProgress = programs.programsInProgress.map((program) => new SimpleProgramDto(program.program, program.progress));
    this.programsNotStarted = programs.programsNotStarted.map((program) => new SimpleProgramDto(program, 0));
  }
}
