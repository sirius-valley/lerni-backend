import { IsInt, IsJSON, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class QuestionnaireUpdateRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  passsingScore: number;

  @IsNotEmpty()
  @IsInt()
  cooldownInMinutes: number;

  @IsNotEmpty()
  @IsJSON()
  block: string;

  @IsNotEmpty()
  questionCount: number;

  @IsInt()
  completionTimeMinutes: number;

  @IsInt()
  order: number;

  constructor(questionnaire: QuestionnaireUpdateRequestDto) {
    this.id = questionnaire.id;
    this.name = questionnaire.name;
    this.description = questionnaire.description;
    this.passsingScore = questionnaire.passsingScore;
    this.cooldownInMinutes = questionnaire.cooldownInMinutes;
    this.block = questionnaire.block;
    this.questionCount = questionnaire.questionCount;
    this.completionTimeMinutes = questionnaire.completionTimeMinutes;
    this.order = questionnaire.order;
  }
}
