import { BubbleDto } from '../../pill/interfaces/bubble';

export enum QuestionnaireState {
  INPROGRESS = 'InProgress',
  FAILED = 'Failed',
  COMPLETED = 'Completed',
}

export class QuestionnaireAnswerDto {
  questionnaireState: QuestionnaireState;
  isCorrect: boolean;
  progress: number;
  correctValue: string[];
  pointsAwarded: number;
  unlockTime?: Date;
  bubbles: BubbleDto[];

  constructor(data: any, correctValue: string[], unlockTime?: Date) {
    this.questionnaireState = data.state;
    this.isCorrect = data.isCorrect;
    this.progress = data.progress;
    this.correctValue = correctValue;
    this.pointsAwarded = data.pointsAwarded;
    this.unlockTime = unlockTime;
    this.bubbles = data.bubbles;
  }
}
