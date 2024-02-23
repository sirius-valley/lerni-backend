import { SimpleStudentDto } from '../../student/dtos/simple-student.dto';

export class CommentDto {
  id: string;
  content: string;
  student: SimpleStudentDto;
  createdAt: Date;

  constructor(data: CommentDto) {
    this.id = data.id;
    this.content = data.content;
    this.student = new SimpleStudentDto(data.student);
    this.createdAt = data.createdAt;
  }
}
