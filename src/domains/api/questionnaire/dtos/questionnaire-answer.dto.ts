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
  correctValues: string[];
  pointsAwarded: number;
  bubbles: BubbleDto[];

  constructor(data: any, correctValues: string[]) {
    this.questionnaireState = data.state;
    this.isCorrect = data.isCorrect;
    this.progress = data.progress;
    this.correctValues = correctValues;
    this.pointsAwarded = data.pointsAwarded;
    this.bubbles = data.bubbles;
  }
}
