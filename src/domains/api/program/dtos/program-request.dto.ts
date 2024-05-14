import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { PillRequestDto } from '../../pill/dtos/pill-request.dto';
import { QuestionnaireRequestDto } from '../../questionnaire/dtos/questionnaire-request.dto';
import { TriviaRequestDto } from '../../trivia/dto/trivia-request.dto';

export class ProgramRequestDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  professor: string;

  @IsNotEmpty()
  @IsArray()
  pill: PillRequestDto[];

  @IsNotEmpty()
  questionnaire: QuestionnaireRequestDto;

  @IsOptional()
  trivia: TriviaRequestDto;

  @IsArray()
  @IsEmail({}, { each: true })
  students: string[];

  @IsInt()
  hoursToComplete: number;

  @IsInt()
  pointsReward: number;

  @IsString()
  @IsOptional()
  startDate: Date;

  @IsString()
  @IsOptional()
  endDate: Date;
}
