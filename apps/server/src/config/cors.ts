import { filter, isEmpty, map, pipe, unique } from 'remeda';

import { env } from './env';

const originOf = (url: string): string | null => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

const webOrigins = pipe(
  env.app.corsOrigins.split(','),
  map((origin) => origin.trim()),
  filter((origin) => !isEmpty(origin))
);

const clientOrigin = originOf(env.app.clientUrl);

export const allowedOrigins = unique([...webOrigins, ...(clientOrigin ? [clientOrigin] : [])]);
