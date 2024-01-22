import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { StudentRepository } from '../domains/api/student/student.repository';
import { ApiRequest } from '../types/api-request.interface';

@Injectable()
export class AttachStudentDataInterceptor implements NestInterceptor {
  constructor(private readonly studentRepository: StudentRepository) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<ApiRequest>();
    if (!req.user) return next.handle();
    const student = await this.studentRepository.findStudentByAuthId(
      req.user.authId,
    );
    if (!student) return next.handle();
    req.user = student;

    return next.handle();
  }
}
