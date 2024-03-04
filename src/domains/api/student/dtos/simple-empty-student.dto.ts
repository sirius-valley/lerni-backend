export class SimpleEmptyStudentDto {
  id: string | undefined;
  name: string | undefined;
  lastname: string | undefined;
  image: string | undefined;

  constructor(data: Partial<SimpleEmptyStudentDto> = {}) {
    this.id = data.id || undefined;
    this.name = data.name || undefined;
    this.lastname = data.lastname || undefined;
    this.image = data.image || undefined;
  }
}
