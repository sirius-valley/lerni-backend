import { Injectable } from '@nestjs/common';
import { StudentDto } from '../student/dtos/student.dto';
import { QuestionnaireRepository } from './questionnaire.repository';

@Injectable()
export class QuestionnaireService {
  constructor(private readonly questionnaireRepository: QuestionnaireRepository) {}

  async getQuestionnaireById(authorization: string, user: StudentDto, questionnaireId: string) {
    const questionnaire = await this.questionnaireRepository.getQuestionnaire(user.id, questionnaireId);
    return questionnaire;
  }
}
