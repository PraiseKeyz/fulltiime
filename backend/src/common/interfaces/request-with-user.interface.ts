import { Request } from 'express';
import { SafeUser } from '@/common/constants/user-select.constant.js';

export interface RequestWithUser extends Request {
  user: SafeUser;
}
