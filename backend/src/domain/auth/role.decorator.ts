import { SetMetadata } from '@nestjs/common';

export type UserRole = 'admin' | 'default';

export const ROLE_KEY = 'ROLE';
export const Role = (role: UserRole) => SetMetadata(ROLE_KEY, role);
