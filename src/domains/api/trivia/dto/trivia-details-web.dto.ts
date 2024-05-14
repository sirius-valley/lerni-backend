export class TriviaDetailsWeb {
  id: string;
  block: string;
  createdAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.block = data.block;
    this.createdAt = data.createdAt;
  }
}
