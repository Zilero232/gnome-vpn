import type { ClientCallbackInput } from './auth.types';

import { validateEnv } from '../../config/env.schema';
import { localizedPath } from '../email';

const env = validateEnv(process.env);

export const withClientCallback = ({ url, locale, path = '/' }: ClientCallbackInput): string => {
  try {
    const parsed = new URL(url);

    parsed.searchParams.set('callbackURL', new URL(localizedPath({ path, locale }), env.CLIENT_URL).toString());

    return parsed.toString();
  } catch {
    return url;
  }
};
