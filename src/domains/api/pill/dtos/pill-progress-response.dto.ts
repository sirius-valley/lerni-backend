import { Pill } from '@prisma/client';
import { PillDto } from './pill.dto';
import { TeacherDto } from './teacher.dto';

export class PillProgressResponseDto {
  pill: PillDto;
  teacher: TeacherDto;
}
