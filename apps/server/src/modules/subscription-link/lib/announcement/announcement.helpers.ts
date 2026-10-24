import { differenceInCalendarDays, differenceInMinutes } from 'date-fns';
import { isNonNullish, isNullish, unique } from 'remeda';

import { pluralize } from '@/common/lib';

import type { AnnouncementNode, HwidHint, HwidHintInput, NodeMomentInput } from './announcement.types';

import { ANNOUNCE, HWID_HINT } from './announcement.constants';

const listFormat = new Intl.ListFormat(ANNOUNCE.locale, { style: 'long', type: 'conjunction' });

export const daysLeftLabel = (days: number): string => `${days} ${pluralize({ count: days, forms: ANNOUNCE.dayForms, locale: ANNOUNCE.locale })}`;

export const isStale = ({ node, now }: NodeMomentInput): boolean => {
  if (isNullish(node.lastHealthyAt)) {
    return true;
  }

  return differenceInMinutes(now, node.lastHealthyAt) >= ANNOUNCE.nodeStaleMinutes;
};

export const isFresh = ({ node, now }: NodeMomentInput): boolean => differenceInCalendarDays(now, node.createdAt) <= ANNOUNCE.freshNodeDays;

export const countryList = (nodes: AnnouncementNode[]): string => listFormat.format(unique(nodes.map((node) => node.country)));

export const hwidHint = ({ needsHwid, isKeyless, deviceId }: HwidHintInput): HwidHint | null => {
  if (needsHwid) {
    return HWID_HINT.required;
  }

  return isKeyless && isNonNullish(deviceId) ? HWID_HINT.nudge : null;
};
