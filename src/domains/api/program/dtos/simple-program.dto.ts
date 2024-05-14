import { Program } from '@prisma/client';

export class SimpleProgramDto {
  id: string;
  name: string;
  icon: string;
  progress: number;

  constructor(program: Program, progress: number) {
    this.id = program.id;
    this.name = program.name;
    this.icon = program.icon;
    this.progress = progress;
  }
}
