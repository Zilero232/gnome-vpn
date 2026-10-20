import { isString } from 'remeda';

import type { FeedTrackerRequest } from './feed-tracker.types';

import { FEED_TRACKER } from './feed-tracker.constants';

export const feedTracker = (req: FeedTrackerRequest): string => {
  const token = req.params?.token;

  return isString(token) && token.length > 0 ? `${FEED_TRACKER.tokenPrefix}${token}` : `${FEED_TRACKER.ipPrefix}${req.ip ?? ''}`;
};
