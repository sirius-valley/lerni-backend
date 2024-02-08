import { BubbleDto } from '../../pill/interfaces/bubble';

export class QuestionnaireDto {
  id: string;
  name: string;
  description: string;
  teacherComment: string;
  version: number;
  completionTimeMinutes: number;
  completed: boolean;
  progress: number;
  bubbles: BubbleDto[];
}
