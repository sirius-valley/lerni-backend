import { Questionnaire } from '@prisma/client';

export class SimpleQuestionnaireDto {
  id: string;
  questionnaireName: string;
  completionTimeMinutes: number;
  questionnaireProgress: number;
  isLocked: boolean;

  constructor(questionnaire: Questionnaire, completionTimeMintues: number, progress: number, isLocked: boolean) {
    this.id = questionnaire.id;
    this.questionnaireName = questionnaire.name;
    this.completionTimeMinutes = completionTimeMintues;
    this.questionnaireProgress = progress;
    this.isLocked = isLocked;
  }
}
