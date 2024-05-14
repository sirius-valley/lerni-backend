import { Pill, PillVersion } from '@prisma/client';
import { BubbleDto } from '../interfaces/bubble';

export class PillDto {
  id: string;
  name: string;
  description: string;
  teacherComment: string;
  version: number;
  pillOrder: number;
  completionTimeMinutes: number;
  completed: boolean;
  progress: number;
  bubbles: BubbleDto[];

  constructor(pill: Pill, pillVersion: PillVersion, order: number, data: any) {
    this.id = pill.id;
    this.name = pill.name;
    this.description = pill.description;
    this.teacherComment = pill.teacherComment;
    this.version = pillVersion.version;
    this.pillOrder = order;
    this.completionTimeMinutes = pillVersion.completionTimeMinutes;
    this.completed = data.completed;
    this.progress = data.progress;
    this.bubbles = data.bubbles;
  }
}
