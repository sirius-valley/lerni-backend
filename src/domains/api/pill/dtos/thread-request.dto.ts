import { IsNotEmpty } from 'class-validator';

export class ThreadRequestDto {
  @IsNotEmpty()
  thread: any;

  constructor(thread: any) {
    this.thread = thread;
  }
}
