import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class StudentRequestDto {
  @IsNotEmpty({ message: 'Name should not be empty' })
  @IsString({ message: 'Name should be a string' })
  @MaxLength(50, { message: 'Name should not exceed 50 characters' })
  name: string;

  @IsNotEmpty({ message: 'Last name should not be empty' })
  @IsString({ message: 'Last name should be a string' })
  @MaxLength(50, { message: 'Last name should not exceed 50 characters' })
  lastname: string;

  @IsOptional()
  @IsString({ message: 'Profession should be a string' })
  profession?: string;

  @IsOptional()
  @IsString({ message: 'Image should be a string' })
  image?: string;

  constructor(
    name: string,
    lastname: string,
    profession?: string,
    image?: string,
  ) {
    this.name = name;
    this.lastname = lastname;
    this.profession = profession;
    this.image = image;
  }
}
