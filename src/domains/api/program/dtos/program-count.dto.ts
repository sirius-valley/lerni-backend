export class ProgramCountDto {
  total: number;
  finished: number;
  inProgress: number;
  toStart: number;

  constructor(data: ProgramCountDto) {
    this.total = data.total;
    this.finished = data.finished;
    this.inProgress = data.inProgress;
    this.toStart = data.toStart;
  }
}
