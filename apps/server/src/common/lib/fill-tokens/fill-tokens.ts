import { entries } from 'remeda';

import type { FillTokensInput } from './fill-tokens.types';

export const fillTokens = ({ text, fill }: FillTokensInput): string =>
  entries(fill).reduce((carry, [token, value]) => carry.replaceAll(`{${token}}`, () => value), text);
