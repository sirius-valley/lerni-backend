import { IsNotEmpty, IsOptional } from 'class-validator';

export class TriviaRequestDto {
  @IsNotEmpty()
  block: string;

  @IsOptional()
  questionsCount: number;

  @IsOptional()
  order: number;
}
