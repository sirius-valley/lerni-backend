import { IsNotEmpty, IsOptional } from 'class-validator';

export class TriviaRequestDto {
  @IsNotEmpty()
  block: string;

  @IsNotEmpty()
  questionsCount: number;

  @IsOptional()
  order: number;
}
