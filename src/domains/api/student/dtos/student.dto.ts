export class StudentDto {
  id: string;
  name?: string;
  lastname?: string;
  profession?: string;
  career?: string;
  city?: string;
  image?: string;
  authId: string;

  constructor(data: StudentDto) {
    this.id = data.id;
    this.name = data.name;
    this.lastname = data.lastname;
    this.profession = data.profession;
    this.career = data.career;
    this.city = data.city;
    this.image = data.image;
    this.authId = data.authId;
  }
}
