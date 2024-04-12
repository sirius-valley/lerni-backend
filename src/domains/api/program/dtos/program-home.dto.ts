import { SimpleProgramDto } from './simple-program.dto';
import { ProgramCardDto } from './program-card.dto';

export class ProgramHomeDto {
  programsCompleted: SimpleProgramDto[];
  programsInProgress: SimpleProgramDto[];
  programsNotStarted: SimpleProgramDto[];

  constructor(programs: { programsCompleted: any[]; programsInProgress: { program: any; progress: number }[]; programsNotStarted: any[] }) {
    this.programsCompleted = programs.programsCompleted.map((program) => new ProgramCardDto(program, 100));
    this.programsInProgress = programs.programsInProgress.map((program) => new ProgramCardDto(program.program, program.progress));
    this.programsNotStarted = programs.programsNotStarted.map((program) => new ProgramCardDto(program, 0));
  }
}
