import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';

export class ProgramStudentsDto {
  programId: string;
  programVersionId: string;
  totalStudents: number;
  studentsCompleted: SimpleStudentDto[];

  constructor(data: any) {
    this.programId = data.programId;
    this.programVersionId = data.programVersionId;
    this.totalStudents = data.totalStudents;
    this.studentsCompleted = data.studentsCompleted;
  }
}
