import { Pill } from '@prisma/client';

export class SimplePillDto {
  id: string;
  pillName: string;
  pillProgress: number;
  isLocked: boolean;

  constructor(pill: Pill, progress: number, isLocked: boolean) {
    this.id = pill.id;
    this.pillName = pill.name;
    this.pillProgress = progress;
    this.isLocked = isLocked;
  }
}
