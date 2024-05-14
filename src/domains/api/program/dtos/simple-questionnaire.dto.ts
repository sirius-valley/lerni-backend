import { Questionnaire } from '@prisma/client';

export class SimpleQuestionnaireDto {
  id: string;
  questionnaireName: string;
  completionTimeMinutes: number;
  questionnaireProgress: number;
  isLocked: boolean;
  lockedUntil?: Date;

  constructor(questionnaire: Questionnaire, completionTimeMintues: number, progress: number, isLocked: boolean, lockedUntil?: Date) {
    this.id = questionnaire.id;
    this.questionnaireName = questionnaire.name;
    this.completionTimeMinutes = completionTimeMintues;
    this.questionnaireProgress = progress;
    this.isLocked = isLocked;
    this.lockedUntil = lockedUntil;
  }
}
