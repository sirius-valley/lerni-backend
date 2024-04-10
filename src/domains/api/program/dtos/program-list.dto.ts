import { Program } from '@prisma/client';

export class ProgramListDto {
  id: string;
  name: string;
  icon: string;
  programVersionId: string;

  constructor(program: Program, programVersionId: string) {
    this.id = program.id;
    this.name = program.name;
    this.icon = program.icon;
    this.programVersionId = programVersionId;
  }
}

export class ProgramListResponseDto {
  results?: ProgramListDto[];
  total: number;

  constructor(results: ProgramListDto[], total: number) {
    this.results = results ? results : [];
    this.total = total;
  }
}
