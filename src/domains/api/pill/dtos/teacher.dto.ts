import { Teacher } from '@prisma/client';

export class TeacherDto {
  id: string;
  name: string;
  lastname: string;
  profession: string;
  image: string | null;

  constructor(teacher: Teacher) {
    this.id = teacher.id;
    this.name = teacher.name;
    this.lastname = teacher.lastname;
    this.profession = teacher.profession;
    this.image = teacher.image;
  }
}
