import type { AUTH_MODE } from '@/shared/constants';

export type AuthMode = (typeof AUTH_MODE)[keyof typeof AUTH_MODE];
