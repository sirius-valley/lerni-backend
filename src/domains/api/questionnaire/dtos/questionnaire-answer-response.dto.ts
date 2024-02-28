import { QuestionnaireAnswerDto } from './questionnaire-answer.dto';
import { TeacherDto } from '../../pill/dtos/teacher.dto';

export class QuestionnaireAnswerResponseDto {
  questionnaire: QuestionnaireAnswerDto;
  teacher: TeacherDto;
}
