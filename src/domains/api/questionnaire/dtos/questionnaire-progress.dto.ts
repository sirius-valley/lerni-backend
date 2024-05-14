import { BubbleDto } from '../../pill/interfaces/bubble';
import { QuestionnaireState } from './questionnaire-answer.dto';

export class QuestionnaireProgressDto {
  questionnaireState: QuestionnaireState;
  progress: number;
  totalPoints: number;
  bubbles: BubbleDto[];
  constructor(data: any) {
    this.questionnaireState = data.state;
    this.progress = data.progress;
    this.bubbles = data.bubbles;
    this.totalPoints = data.totalPoints;
  }
}
