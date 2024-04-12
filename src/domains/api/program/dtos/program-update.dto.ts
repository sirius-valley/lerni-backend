import { IsArray, IsEmail, IsInt, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { PillUpdateRequestDto } from '../../pill/dtos/pill-update.dto';
import { QuestionnaireUpdateRequestDto } from '../../questionnaire/dtos/questionnaire-update.dto';

export class ProgramUpdateRequestDto {
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
  pill: PillUpdateRequestDto[];

  @IsNotEmpty()
  questionnaire: QuestionnaireUpdateRequestDto;

  @IsString()
  trivia: string;

  @IsArray()
  @IsEmail({}, { each: true })
  students: string[];

  @IsInt()
  hoursToComplete: number;

  @IsInt()
  pointsReward: number;
}
