export class SimpleStudentDto {
  id: string;
  name: string | null;
  lastname: string | null;
  image: string | null;
  pointCount: number;
  authId: string | null;

  constructor(data: SimpleStudentDto) {
    this.id = data.id;
    this.name = data.name;
    this.lastname = data.lastname;
    this.image = data.image;
    this.pointCount = data.pointCount;
    this.authId = data.authId;
  }
}
