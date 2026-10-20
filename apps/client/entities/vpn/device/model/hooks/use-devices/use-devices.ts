'use client';

import { useQuery } from '@tanstack/react-query';

import { getDevices, useHasSession } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

import { DEVICES_REFRESH_MS } from './use-devices.constants';

export const useDevices = () => {
  const hasSession = useHasSession();

  return useQuery({
    queryKey: QUERY_KEYS.devices(),
    queryFn: getDevices,
    enabled: hasSession,
    refetchOnWindowFocus: true,
    refetchInterval: DEVICES_REFRESH_MS
  });
};
