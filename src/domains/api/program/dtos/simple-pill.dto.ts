import { Pill } from '@prisma/client';

export class SimplePillDto {
  id: string;
  pillName: string;
  pillProgress: number;

  constructor(pill: Pill, progress: number) {
    this.id = pill.id;
    this.pillName = pill.name;
    this.pillProgress = progress;
  }
}
