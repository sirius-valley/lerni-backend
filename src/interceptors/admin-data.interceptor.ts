import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { ProfessorRepository } from '../domains/api/professor/professor.repository';
import { Observable } from 'rxjs';
import { ApiRequest } from '../types/api-request.interface';

@Injectable()
export class AdminDataInterceptor implements NestInterceptor {
  constructor(private readonly professorRepository: ProfessorRepository) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<ApiRequest>();
    if (!req.user) return next.handle();
    const admin = await this.professorRepository.getProfessorById(req.user.authId);
    if (!admin) throw new HttpException('Unauthorized', 401);

    return next.handle();
  }
}
