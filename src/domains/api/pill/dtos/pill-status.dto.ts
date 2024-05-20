import { Pill, PillVersion } from '@prisma/client';

export class PillStatusDto {
  id: string;
  name: string;
  pillOrder: number;
  completionTimeMinutes: number;
  progress: number;

  constructor(pill: Pill, pillVersion: PillVersion, order: number, progress: number) {
    this.id = pill.id;
    this.name = pill.name;
    this.pillOrder = order;
    this.completionTimeMinutes = pillVersion.completionTimeMinutes;
    this.progress = progress;
  }
}
