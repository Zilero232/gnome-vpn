'use client';

import { useQuery } from '@tanstack/react-query';

import { getPendingDiscount, useHasSession } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const usePendingDiscount = () => {
  const hasSession = useHasSession();

  const { data: pending } = useQuery({ queryKey: QUERY_KEYS.pendingDiscount(), queryFn: getPendingDiscount, enabled: hasSession });

  return pending?.discount ?? null;
};
