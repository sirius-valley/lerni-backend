import { QuestionnaireDto } from './questionnaire.dto';
import { TeacherDto } from '../../pill/dtos/teacher.dto';

export class QuestionnaireProgressResponseDto {
  questionnaire: QuestionnaireDto;
  teacher: TeacherDto;
}
