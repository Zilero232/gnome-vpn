import type { IsAdminInput } from './admin-email.types';

export const isAdmin = ({ email, emailVerified, admins }: IsAdminInput): boolean => emailVerified && admins.includes(email.trim().toLowerCase());
