import { isNullish } from 'remeda';

import type { NodeRestart } from '@/modules/telegram/notify';

import { ALERT } from '@/modules/scheduler/config';

import type { NodeRestartInput, StartedLaterInput } from './node-restart.types';

const startedLater = ({ previous, current }: StartedLaterInput): boolean =>
  !isNullish(previous) && !isNullish(current) && current.getTime() - previous.getTime() > ALERT.restartToleranceMs;

export const nodeRestart = ({ previous, current }: NodeRestartInput): NodeRestart | null => {
  if (startedLater({ previous: previous.bootedAt, current: current.bootedAt })) {
    return 'reboot';
  }

  if (startedLater({ previous: previous.coreStartedAt, current: current.coreStartedAt })) {
    return 'core';
  }

  return null;
};
