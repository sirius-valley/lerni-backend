import { Program } from '@prisma/client';

export class SearchProgramDto {
  id: string;
  name: string;
  icon: string;

  constructor(program: Program) {
    this.id = program.id;
    this.name = program.name;
    this.icon = program.icon;
  }
}
