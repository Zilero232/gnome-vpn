import type { NodeState } from '@gnomevpn/schemas';

import { NODE_STATE } from '@gnomevpn/schemas';
import { isBefore } from 'date-fns';
import { isNonNullish, isNullish } from 'remeda';

import type { PassedCheckInput, ProbeStamps } from './node-state.types';

import { NODE_DOWN } from './node-state.constants';

export const nodeState = ({ lastHealthyAt, lastCheckedAt, isOverloaded }: ProbeStamps): NodeState => {
  if (isNullish(lastHealthyAt)) {
    return NODE_STATE.down;
  }

  const failingForMs = isNullish(lastCheckedAt) ? 0 : lastCheckedAt.getTime() - lastHealthyAt.getTime();

  if (failingForMs > (NODE_DOWN.failedChecks - 1) * NODE_DOWN.checkIntervalMs) {
    return NODE_STATE.down;
  }

  return failingForMs > 0 || isOverloaded ? NODE_STATE.degraded : NODE_STATE.up;
};

export const passedCheck = ({ lastHealthyAt, checkedAt }: PassedCheckInput): boolean =>
  isNonNullish(lastHealthyAt) && !isBefore(lastHealthyAt, checkedAt);
