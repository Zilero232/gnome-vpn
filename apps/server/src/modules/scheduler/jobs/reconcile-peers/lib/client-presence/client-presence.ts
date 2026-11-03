import { differenceInDays } from 'date-fns';
import { isNullish } from 'remeda';

import { QUIET_CLIENT } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.constants';

import type { IsQuietClientInput } from './client-presence.types';

export const isQuietClient = ({ email, presence, now }: IsQuietClientInput): boolean => {
  if (presence.online.has(email)) {
    return false;
  }

  const lastSeen = presence.lastOnline.get(email);

  return isNullish(lastSeen) || differenceInDays(now, lastSeen) >= QUIET_CLIENT.idleDays;
};
