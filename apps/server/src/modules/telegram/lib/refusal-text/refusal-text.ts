import { isNonNullish } from 'remeda';

import { errorCodeOf } from '@/common/lib';

import type { RefusalTextInput } from './refusal-text.types';

export const refusalText = ({ error, copies, fallback, onUnknown }: RefusalTextInput): string => {
  const code = errorCodeOf(error);
  const known = isNonNullish(code) ? copies[code] : undefined;

  if (isNonNullish(known)) {
    return known;
  }

  onUnknown(error);

  return fallback;
};
