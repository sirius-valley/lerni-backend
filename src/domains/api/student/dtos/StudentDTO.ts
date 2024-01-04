export class StudentDTO {
  id: string;
  name: string;
  lastname: string;
  profession?: string;
  image?: string;
  authId: string;

  constructor(data: StudentDTO) {
    this.id = data.id;
    this.name = data.name;
    this.lastname = data.lastname;
    this.profession = data.profession;
    this.image = data.image;
    this.authId = data.authId;
  }
}
