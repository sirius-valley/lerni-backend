import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PillUpdateRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;

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

  constructor(data: PillUpdateRequestDto) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.teacherComment = data.teacherComment;
    this.version = data.version;
    this.completionTimeMinutes = data.completionTimeMinutes;
    this.block = data.block;
  }
}
