import { AUTH_ERROR_FIELDS } from './auth-error-field.constants';

export type AuthErrorField = (typeof AUTH_ERROR_FIELDS)[keyof typeof AUTH_ERROR_FIELDS];

export const authErrorField = (key: string): AuthErrorField | null =>
  Object.entries(AUTH_ERROR_FIELDS).find(([candidate]) => candidate === key)?.[1] ?? null;
