'use client';

import type { AdminUserQuery } from '@gnomevpn/schemas';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getAdminUsers } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminUsers = (query: AdminUserQuery) =>
  useQuery({
    queryKey: QUERY_KEYS.adminUsers(query),
    queryFn: () => getAdminUsers(query),
    placeholderData: keepPreviousData
  });
