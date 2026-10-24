import type { IsAdminInput } from './admin.types';

export const isAdmin = ({ email, emailVerified, admins }: IsAdminInput): boolean => emailVerified && admins.includes(email.trim().toLowerCase());
