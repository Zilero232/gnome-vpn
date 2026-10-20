import { isEmpty } from 'remeda';

import { BOT_URL_BASE } from './bot-url.constants';

export const botUrl = (username: string | undefined): string | undefined => {
  const name = username?.trim().replace(/^@/u, '');

  return name === undefined || isEmpty(name) ? undefined : `${BOT_URL_BASE}${name}`;
};
