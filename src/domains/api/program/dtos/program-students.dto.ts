export class ProgramStudentsDto {
  programId: string;
  programVersionId: string;
  totalStudents: number;
  notStarted: number;
  inProgress: number;
  completed: number;

  constructor(data: any) {
    this.programId = data.programId;
    this.programVersionId = data.programVersionId;
    this.totalStudents = data.totalStudents;
    this.notStarted = data.notStarted;
    this.inProgress = data.inProgress;
    this.completed = data.completed;
  }
}
