export class SimpleEmptyStudentDto {
  id?: string;
  name?: string;
  lastname?: string;
  email: string;
  image?: string;

  constructor(data: SimpleEmptyStudentDto) {
    this.id = data?.id;
    this.name = data?.name;
    this.lastname = data?.lastname;
    this.image = data?.image;
    this.email = data.email;
  }
}
