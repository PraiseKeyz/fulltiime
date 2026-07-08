import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../generated/prisma/index.js';
import { MIN_ROLE_KEY } from '@/common/decorators/roles.decorator.js';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface.js';

/** USER < WRITER < EDITOR < ADMIN — higher roles inherit everything below. */
const ROLE_LEVEL: Record<Role, number> = {
  [Role.USER]: 0,
  [Role.WRITER]: 1,
  [Role.EDITOR]: 2,
  [Role.ADMIN]: 3,
};

export function roleAtLeast(role: Role, min: Role): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[min];
}

/**
 * Enforces `@MinRole(...)`. Must run after JwtAuthGuard so `request.user`
 * is populated: `@UseGuards(JwtAuthGuard, RolesGuard)`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const minRole = this.reflector.getAllAndOverride<Role | undefined>(MIN_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!minRole) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user || !roleAtLeast(user.role, minRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
