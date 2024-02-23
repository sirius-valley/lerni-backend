export class SimpleStudentDto {
  id: string;
  name: string | null;
  lastname: string | null;
  image: string | null;

  constructor(data: SimpleStudentDto) {
    this.id = data.id;
    this.name = data.name;
    this.lastname = data.lastname;
    this.image = data.image;
  }
}
