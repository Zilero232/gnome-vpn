import type { BotText } from '../../telegram.types';
import type { BroadcastAudience } from './broadcast.types';

import { BROADCAST } from '../../config';

export const SEND_INTERVAL_MS = Math.ceil(1_000 / BROADCAST.perSecond);

export const SOURCE_ID = /^\d+$/u;

export const CHOICE_PARTS = 2;

export const AUDIENCE_LABEL: Record<BroadcastAudience, keyof BotText> = {
  all: 'broadcastAll',
  active: 'broadcastActive',
  inactive: 'broadcastInactive'
};
