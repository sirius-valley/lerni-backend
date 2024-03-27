import { TeacherDto } from '../../pill/dtos/teacher.dto';

export class ProgramAdminDetailsDto {
  id: string;
  programName: string;
  teacher: TeacherDto;
  icon: string;
  estimatedHours: number;
  points: number;
  programDescription: string;
  pills: any[];
  questionnaire: any[];
  students: any[];
  trivias: any[];

  constructor(programDetailsDto: ProgramAdminDetailsDto) {
    this.id = programDetailsDto.id;
    this.programName = programDetailsDto.programName;
    this.teacher = programDetailsDto.teacher;
    this.icon = programDetailsDto.icon;
    this.estimatedHours = programDetailsDto.estimatedHours;
    this.points = programDetailsDto.points;
    this.programDescription = programDetailsDto.programDescription;
    this.pills = programDetailsDto.pills;
    this.questionnaire = programDetailsDto.questionnaire;
    this.students = programDetailsDto.students;
    this.trivias = programDetailsDto.trivias;
  }
}
