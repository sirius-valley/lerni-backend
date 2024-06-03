export class ProgramCountDto {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;

  constructor(data: ProgramCountDto) {
    this.total = data.total;
    this.completed = data.completed;
    this.inProgress = data.inProgress;
    this.notStarted = data.notStarted;
  }
}
