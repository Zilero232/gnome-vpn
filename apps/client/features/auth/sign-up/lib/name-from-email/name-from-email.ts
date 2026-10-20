import { NAME } from './name-from-email.constants';

export const nameFromEmail = (email: string) => {
  const local = email.trim().split('@')[0].slice(0, NAME.maxLength);

  return local.length >= NAME.minLength ? local : email.trim().slice(0, NAME.maxLength);
};
