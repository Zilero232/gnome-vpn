import type { UnwrapAuthInput } from './unwrap-auth.types';

import { AuthError } from '../auth-error';
import { RATE_LIMIT } from './unwrap-auth.constants';

export const unwrapAuth = <T>({ result, fallbackKey }: UnwrapAuthInput<T>): T => {
  if (result.error) {
    const code = result.error.status === RATE_LIMIT.status ? RATE_LIMIT.code : result.error.code;

    throw new AuthError({ code, fallbackKey });
  }

  return result.data;
};
