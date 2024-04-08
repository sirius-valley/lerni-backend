export class SimpleProfessortDto {
  name: string;
  lastname?: string | null;
  profession: string | null;
  description?: string | null;
  image?: string | null;
  id: string;

  constructor(professor: SimpleProfessortDto) {
    this.id = professor.id;
    this.name = professor.name;
    this.lastname = professor.lastname;
    this.profession = professor.profession;
    this.description = professor.description;
    this.image = professor.image;
  }
}
