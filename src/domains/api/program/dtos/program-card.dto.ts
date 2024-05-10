import { TeacherDto } from '../../pill/dtos/teacher.dto';

export class ProgramCardDto {
  id: string;
  name: string;
  icon: string;
  teacher: TeacherDto;
  progress: number;
  locked: boolean;
  dateUnlocked?: Date;

  constructor(program: any, progress: number, locked: boolean, dateUnlocked?: Date) {
    this.id = program.id;
    this.name = program.name;
    this.icon = program.icon;
    this.teacher = new TeacherDto(program.teacher);
    this.progress = progress;
    this.locked = locked;
    this.dateUnlocked = dateUnlocked;
  }
}
