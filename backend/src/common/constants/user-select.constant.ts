import { Prisma } from '../../../generated/prisma/index.js';

export const SafeUserSelect = {
  id: true,
  email: true,
  username: true,
  full_name: true,
  avatar_url: true,
  role: true,
  is_verified: true,
  must_change_password: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof SafeUserSelect }>;
