import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma/index.js';

export const MIN_ROLE_KEY = 'minRole';

/**
 * Minimum role required for a route. Roles are hierarchical
 * (USER < WRITER < EDITOR < ADMIN), so `@MinRole(Role.EDITOR)` admits
 * editors AND admins. Use together with JwtAuthGuard + RolesGuard.
 */
export const MinRole = (role: Role) => SetMetadata(MIN_ROLE_KEY, role);
