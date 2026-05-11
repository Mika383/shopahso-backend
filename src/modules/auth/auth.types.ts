import { AppRole } from '@prisma/client';

export type JwtUserPayload = {
  sub: string;
  email: string;
  role: AppRole;
  type: 'access' | 'refresh';
};
