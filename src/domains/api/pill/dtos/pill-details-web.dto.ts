export class PillDetailsWeb {
  pillVersionId: string;
  pillId: string;
  name: string;
  description: string;
  teacherComment: string;
  order: number;
  version: number;
  block: string;
  createdAt: Date;

  constructor(data: any, order: number) {
    this.pillVersionId = data.id;
    this.pillId = data.pillId;
    this.name = data.pill.name;
    this.description = data.pill.description;
    this.teacherComment = data.pill.teacherComment;
    this.order = order;
    this.version = data.version;
    this.block = data.block;
    this.createdAt = data.createdAt;
  }
}
