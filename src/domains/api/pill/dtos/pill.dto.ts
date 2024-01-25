import { Pill, PillVersion } from '@prisma/client';

export class PillDto {
  id: string;
  name: string;
  description: string;
  teacherComment: string;
  version: number;
  completionTimeMinutes: number;
  data: any;

  constructor(pill: Pill, pillVersion: PillVersion, data: any) {
    this.id = pill.id;
    this.name = pill.name;
    this.description = pill.description;
    this.teacherComment = pill.teacherComment;
    this.version = pillVersion.version;
    this.completionTimeMinutes = pillVersion.completionTimeMinutes;
    this.data = data;
  }
}
