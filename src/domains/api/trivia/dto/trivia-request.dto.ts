import { IsJSON, IsNotEmpty } from 'class-validator';

export class TriviaRequestDto {
  @IsNotEmpty()
  @IsJSON()
  block: string;

  constructor(trivia: TriviaRequestDto) {
    this.block = trivia.block;
  }
}
