import { TeacherDto } from '../../pill/dtos/teacher.dto';
import { PillDetailsWeb } from '../../pill/dtos/pill-details-web.dto';
import { QuestionnaireDetailsWeb } from '../../questionnaire/dtos/questionnaire-details-web.dto';
import { StudentDto } from '../../student/dtos/student.dto';
import { TriviaDetailsWeb } from '../../trivia/dto/trivia-details-web.dto';

export class ProgramAdminDetailsDto {
  id: string;
  programName: string;
  teacher: TeacherDto;
  icon: string;
  estimatedHours: number;
  points: number;
  programDescription: string;
  pills: PillDetailsWeb[];
  questionnaire: QuestionnaireDetailsWeb[];
  students: StudentDto[];
  trivias: TriviaDetailsWeb[];

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
