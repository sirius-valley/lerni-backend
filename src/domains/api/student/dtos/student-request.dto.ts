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
  @IsString({ message: 'Career should be a string' })
  career?: string;

  @IsNotEmpty({ message: 'City should not be empty' })
  @IsString({ message: 'City should be a string' })
  @MaxLength(50, { message: 'City should not exceed 50 characters' })
  city: string;

  @IsOptional()
  @IsString({ message: 'Image should be a string' })
  image?: string;

  constructor(name: string, lastname: string, city: string, profession?: string, career?: string, image?: string) {
    this.name = name;
    this.lastname = lastname;
    this.profession = profession;
    this.career = career;
    this.city = city;
    this.image = image;
  }
}
