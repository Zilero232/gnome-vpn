'use client';

import { useQuery } from '@tanstack/react-query';

import { getGifts, useHasSession } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

import { GIFT_POLL } from '../../../config';

export const useGifts = () => {
  const hasSession = useHasSession();

  return useQuery({
    queryKey: QUERY_KEYS.gifts(),
    queryFn: getGifts,
    enabled: hasSession,
    refetchInterval: (query) => ((query.state.data?.pendingCount ?? 0) > 0 ? GIFT_POLL.pendingMs : false)
  });
};
