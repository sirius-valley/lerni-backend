import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PillRequestDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  teacherComment: string;

  @IsOptional()
  @IsNumber()
  version: number;

  @IsNumber()
  completionTimeMinutes: number;

  @IsNotEmpty()
  block: string;

  constructor(data: PillRequestDto) {
    this.name = data.name;
    this.description = data.description;
    this.teacherComment = data.teacherComment;
    this.version = data.version;
    this.completionTimeMinutes = data.completionTimeMinutes;
    this.block = data.block;
  }
}
