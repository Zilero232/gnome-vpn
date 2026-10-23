'use client';

import type { AdminAnalyticsRange } from '@gnomevpn/schemas';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getAdminAnalytics } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminAnalytics = (range: AdminAnalyticsRange) =>
  useQuery({
    queryKey: QUERY_KEYS.adminAnalytics(range),
    queryFn: () => getAdminAnalytics(range),
    placeholderData: keepPreviousData
  });
