import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip CSRF check for GET requests
    if (request.method === 'GET') {
      return true;
    }

    // Skip CSRF check for public endpoints
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
    if (publicEndpoints.includes(request.path)) {
      return true;
    }

    // Verify CSRF token
    const csrfToken = request.headers['x-csrf-token'] as string;
    const sessionToken = request.cookies?.['csrf-token'];

    if (!csrfToken || !sessionToken) {
      throw new UnauthorizedException('CSRF token missing');
    }

    if (csrfToken !== sessionToken) {
      throw new UnauthorizedException('CSRF token mismatch');
    }

    return true;
  }
}
