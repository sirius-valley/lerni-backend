import { Program } from '@prisma/client';
import { SearchType } from './search-result.dto';
import { SimpleProfessortDto } from '../../professor/dto/simple-professor.dto';

export enum ProgramStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  LOCKED = 'locked',
}

export class SearchProgramDto {
  id: string;
  name: string;
  icon: string;
  searchType: SearchType = SearchType.PROGRAM;
  description: string | null;
  progress: number;
  status: ProgramStatus;
  dateUnlocked?: Date;
  teacher: SimpleProfessortDto;

  constructor(program: Program, teacher: SimpleProfessortDto, progress: number, status: ProgramStatus, dateUnlocked?: Date) {
    this.id = program.id;
    this.name = program.name;
    this.icon = program.icon;
    this.description = program.description;
    this.progress = progress;
    this.status = status;
    this.dateUnlocked = dateUnlocked;
    this.teacher = teacher;
  }
}
