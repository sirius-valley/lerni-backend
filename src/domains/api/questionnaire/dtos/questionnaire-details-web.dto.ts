export class QuestionnaireDetailsWeb {
  questionnaireVersionId: string;
  questionnaireId: string;
  name: string;
  description: string;
  version: number;
  passingScore: number;
  cooldownInMinutes: number;
  completionTimeMintues: number;
  block: string;
  questionCount: number;
  createdAt: Date;

  constructor(data: any) {
    this.questionnaireVersionId = data.id;
    this.questionnaireId = data.questionnaireId;
    this.name = data.questionnaire.name;
    this.description = data.questionnaire.description;
    this.version = data.version;
    this.passingScore = data.passing_score;
    this.cooldownInMinutes = data.cooldownInMinutes;
    this.completionTimeMintues = data.completionTimeMintues;
    this.block = data.block;
    this.questionCount = data.questionCount;
    this.createdAt = data.createdAt;
  }
}
