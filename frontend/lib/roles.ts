import type { Role } from '@/lib/api/domain'

/** Mirrors the backend RolesGuard: USER < WRITER < EDITOR < ADMIN. */
const ROLE_LEVEL: Record<Role, number> = {
  USER: 0,
  WRITER: 1,
  EDITOR: 2,
  ADMIN: 3,
}

export function roleAtLeast(role: Role | undefined | null, min: Role): boolean {
  if (!role) return false
  return ROLE_LEVEL[role] >= ROLE_LEVEL[min]
}
