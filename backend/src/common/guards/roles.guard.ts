import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  Permission,
  UserRole,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
} from '../constants/roles.constant';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions?: Permission[];
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    // If no permissions or roles required, allow access
    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required role
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = this.hasRequiredRole(user.role, requiredRoles);
      if (!hasRequiredRole) {
        throw new ForbiddenException(
          `Insufficient role. Required: ${requiredRoles.join(', ')}, Current: ${user.role}`,
        );
      }
    }

    // Check if user has required permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermissions = this.hasRequiredPermissions(
        user.role,
        requiredPermissions,
      );
      if (!hasRequiredPermissions) {
        throw new ForbiddenException(
          `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }

  private hasRequiredRole(
    userRole: UserRole,
    requiredRoles: UserRole[],
  ): boolean {
    // Direct role match
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // Check role hierarchy
    const userHierarchy = ROLE_HIERARCHY[userRole] || [];
    return requiredRoles.some((requiredRole) =>
      userHierarchy.includes(requiredRole),
    );
  }

  private hasRequiredPermissions(
    userRole: UserRole,
    requiredPermissions: Permission[],
  ): boolean {
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
