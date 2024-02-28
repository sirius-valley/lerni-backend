import { QuestionnaireProgressDto } from './questionnaire-progress.dto';
import { TeacherDto } from '../../pill/dtos/teacher.dto';

export class QuestionnaireProgressResponseDto {
  questionnaire: QuestionnaireProgressDto;
  teacher: TeacherDto;
}
