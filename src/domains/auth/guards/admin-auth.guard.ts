import { CanActivate, ExecutionContext } from '@nestjs/common';

export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user.role === 'admin';
  }
}
