'use client';

import { useQuery } from '@tanstack/react-query';

import { getServerStatus } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

import { SERVER_STATUS_REFRESH_MS } from './use-server-status.constants';

export const useServerStatus = () =>
  useQuery({
    queryKey: QUERY_KEYS.serverStatus(),
    queryFn: getServerStatus,
    refetchInterval: SERVER_STATUS_REFRESH_MS
  });
