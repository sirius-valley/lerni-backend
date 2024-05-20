import { PillStatusDto } from '../../pill/dtos/pill-status.dto';
import { QuestionnaireAnswerDto } from '../../questionnaire/dtos/questionnaire-answer.dto';

export class StudentStatusDto {
  id: string;
  name?: string | null;
  lastname?: string | null;
  image?: string | null;
  email?: string | null;
  pills?: PillStatusDto[];
  questionnaires?: QuestionnaireAnswerDto[];

  constructor(data: StudentStatusDto) {
    this.id = data.id;
    this.name = data.name;
    this.lastname = data.lastname;
    this.image = data.image;
    this.email = data?.email;
    this.pills = data?.pills;
    this.questionnaires = data?.questionnaires;
  }
}
