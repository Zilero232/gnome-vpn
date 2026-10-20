'use client';

import { resolveLimits } from '@gnomevpn/schemas';
import { useQuery } from '@tanstack/react-query';

import { getSubscriptionStatus, useHasSession } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

import { isCheckoutPending } from '../../../lib';
import { SUBSCRIPTION_POLL } from './use-subscription-status.constants';

export const useSubscriptionStatus = () => {
  const hasSession = useHasSession();

  const { data, dataUpdatedAt, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.subscriptionStatus(),
    queryFn: getSubscriptionStatus,
    enabled: hasSession,
    refetchOnWindowFocus: true,
    retry: SUBSCRIPTION_POLL.retries,
    refetchInterval: (query) => {
      if (query.state.error) {
        return Math.min(SUBSCRIPTION_POLL.errorMs * 2 ** query.state.fetchFailureCount, SUBSCRIPTION_POLL.maxErrorMs);
      }

      return isCheckoutPending() ? SUBSCRIPTION_POLL.pendingMs : SUBSCRIPTION_POLL.idleMs;
    }
  });

  const hasAccess = data?.status === 'active';

  return {
    subscription: data ?? null,
    dataUpdatedAt,
    isLoading,
    isError,
    isUnavailable: isError && !data,
    refetch,
    hasAccess,
    limits: data?.limits ?? resolveLimits(0)
  };
};
