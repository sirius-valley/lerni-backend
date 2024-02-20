import { BubbleDto } from '../../pill/interfaces/bubble';

export enum QuestionnaireState {
  INPROGRESS = 'InProgress',
  FAILED = 'Failed',
  COMPLETED = 'Completed',
}

export class QuestionnaireDto {
  questionnaireState: QuestionnaireState;
  isCorrect: boolean;
  progress: number;
  pointsAwarded: number;
  bubbles: BubbleDto[];

  constructor(data: any) {
    this.questionnaireState = data.state;
    this.isCorrect = data.isCorrect;
    this.progress = data.progress;
    this.pointsAwarded = data.pointsAwarded;
    this.bubbles = data.bubbles;
  }
}
