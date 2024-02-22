import { Questionnaire } from '@prisma/client';

export class SimpleQuestionnaireDto {
  id: string;
  questionnaireName: string;
  questionnaireProgress: number;
  isLocked: boolean;

  constructor(questionnaire: Questionnaire, progress: number, isLocked: boolean) {
    this.id = questionnaire.id;
    this.questionnaireName = questionnaire.name;
    this.questionnaireProgress = progress;
    this.isLocked = isLocked;
  }
}
