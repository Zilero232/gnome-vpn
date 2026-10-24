import type { BotText } from '@/modules/telegram/telegram.types';

import { BROADCAST } from '@/modules/telegram/config';

import type { BroadcastAudience } from './broadcast.types';

export const SEND_INTERVAL_MS = Math.ceil(1_000 / BROADCAST.perSecond);

export const SOURCE_ID = /^\d+$/u;

export const AUDIENCE_LABEL: Record<BroadcastAudience, keyof BotText> = {
  all: 'broadcastAll',
  active: 'broadcastActive',
  inactive: 'broadcastInactive'
};
