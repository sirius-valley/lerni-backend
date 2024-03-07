import { Pill } from '@prisma/client';
import { IsArray, IsEmail, IsJSON, IsNotEmpty, IsString, IsUrl } from 'class-validator';

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
  pill: Pill[];

  @IsJSON()
  questionnaire: string;

  @IsJSON()
  trivia: string;

  @IsArray()
  @IsEmail({}, { each: true })
  students: string[];

  constructor(program: ProgramRequestDto) {
    this.title = program.title;
    this.image = program.image;
    this.description = program.description;
    this.questionnaire = program.questionnaire;
    this.pill = program.pill;
    this.professor = program.professor;
    this.trivia = program.trivia;
    this.students = program.students;
  }
}
