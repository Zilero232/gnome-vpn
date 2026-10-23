import { getUnixTime } from 'date-fns';
import { isNullish } from 'remeda';

import type { NextRoutingStampInput, RoutingProfile } from './incy-routing.types';

import { ROUTING_PROFILE } from './incy-routing.constants';

export const lastUpdated = (routingUpdatedAt: Date | null): number =>
  ROUTING_PROFILE.revision + (isNullish(routingUpdatedAt) ? 0 : Math.max(0, getUnixTime(routingUpdatedAt) - ROUTING_PROFILE.epoch));

export const encodedProfile = (profile: RoutingProfile): string => Buffer.from(JSON.stringify(profile), 'utf8').toString('base64');

export const nextRoutingStamp = ({ previous, now }: NextRoutingStampInput): Date =>
  new Date(Math.max(now.getTime(), isNullish(previous) ? 0 : previous.getTime() + ROUTING_PROFILE.stampStepMs));
