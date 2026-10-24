import { differenceInMilliseconds, differenceInMinutes } from 'date-fns';
import { isNullish } from 'remeda';

import type { NodeAlertInput, NodeAlertOutcome, NodeSilenceInput, NodeStatus, NodeStatusInput } from './owner-text.types';

import { OWNER_ALERT, QUIET_NODE } from './owner-text.constants';

const isSilent = ({ healthyAt, now }: NodeSilenceInput): boolean => differenceInMinutes(now, healthyAt) >= OWNER_ALERT.nodeDownAfterMinutes;

export const nodeStatus = ({ isAvailable, healthyAt, now }: NodeStatusInput): NodeStatus => {
  if (!isAvailable) {
    return 'off';
  }

  return isSilent({ healthyAt, now }) ? 'down' : 'up';
};

export const nodeAlert = ({ state = QUIET_NODE, isUp, healthyAt, now }: NodeAlertInput): NodeAlertOutcome => {
  if (isUp) {
    return state.isAnnouncedDown ? { state: { ...state, isAnnouncedDown: false }, alert: 'recovered' } : { state, alert: null };
  }

  const isRepeatDue = isNullish(state.downAlertedAt) || differenceInMilliseconds(now, state.downAlertedAt) >= OWNER_ALERT.repeatMs;

  if (!isSilent({ healthyAt, now }) || !isRepeatDue) {
    return { state, alert: null };
  }

  return { state: { isAnnouncedDown: true, downAlertedAt: now }, alert: 'down' };
};
