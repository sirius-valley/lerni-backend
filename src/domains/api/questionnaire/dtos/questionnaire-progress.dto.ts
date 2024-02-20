import { BubbleDto } from '../../pill/interfaces/bubble';

export enum QuestionnaireState {
  InProgress = 'InProgress',
  Failed = 'Failed',
  Completed = 'Completed',
}

export class QuestionnaireProgressDto {
  questionnaireState: QuestionnaireState;
  isCorrect: boolean;
  progress: number;
  bubbles: BubbleDto[];

  constructor(data: any) {
    this.questionnaireState = data.state;
    this.isCorrect = data.isCorrect;
    this.progress = data.progress;
    this.bubbles = data.bubbles;
  }
}
