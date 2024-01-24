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

  constructor(data: StudentDto, hasCompletedIntroduction: boolean) {
    this.id = data.id;
    this.name = data.name;
    this.lastname = data.lastname;
    this.city = data.city;
    this.profession = data.profession;
    this.career = data.carreer;
    this.image = data.image;
    this.hasCompletedIntroduction = hasCompletedIntroduction;
  }
}
