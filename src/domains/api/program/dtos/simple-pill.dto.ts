import { Pill } from '@prisma/client';

export class SimplePillDto {
  id: string;
  pillName: string;
  pillProgress: number;
  completionTimeMinutes: number;
  isLocked: boolean;

  constructor(pill: Pill, completionTimeMinutes: number, progress: number, isLocked: boolean) {
    this.id = pill.id;
    this.pillName = pill.name;
    this.completionTimeMinutes = completionTimeMinutes;
    this.pillProgress = progress;
    this.isLocked = isLocked;
  }
}
