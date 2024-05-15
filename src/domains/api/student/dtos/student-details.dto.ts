import { StudentDto } from './student.dto';

export class StudentDetailsDto {
  id: string;
  name?: string;
  lastname?: string;
  city?: string;
  profession?: string;
  career?: string;
  image?: string;
  hasCompletedIntroduction: boolean;
  points?: number;
  ranking?: number;

  constructor(
    data: StudentDto,
    {
      hasCompletedIntroduction,
      points,
      ranking,
    }: {
      points: number;
      hasCompletedIntroduction: boolean;
      ranking: number;
    },
  ) {
    this.id = data.id;
    this.name = data.name;
    this.lastname = data.lastname;
    this.city = data.city;
    this.profession = data.profession;
    this.career = data.career;
    this.image = data.image;
    this.hasCompletedIntroduction = hasCompletedIntroduction;
    this.points = points;
    this.ranking = ranking;
  }
}
