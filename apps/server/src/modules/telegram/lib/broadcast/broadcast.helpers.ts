import type { BroadcastAudience, BroadcastChoice } from './broadcast.types';

import { BROADCAST_AUDIENCES } from '../../config';
import { CHOICE_PARTS, SOURCE_ID } from './broadcast.constants';

const AUDIENCES: readonly string[] = BROADCAST_AUDIENCES;

const isAudience = (raw: string): raw is BroadcastAudience => AUDIENCES.includes(raw);

export const parseChoice = (parts: string[]): BroadcastChoice | null => {
  if (parts.length !== CHOICE_PARTS) {
    return null;
  }

  const [audience, source] = parts;
  const id = Number(source);

  if (!isAudience(audience) || !SOURCE_ID.test(source) || !Number.isSafeInteger(id)) {
    return null;
  }

  return { audience, source: id };
};
