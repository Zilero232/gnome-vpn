'use client';

import type { AdminGiftQuery } from '@gnomevpn/schemas';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getAdminGifts } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminGifts = (query: AdminGiftQuery) =>
  useQuery({
    queryKey: QUERY_KEYS.adminGifts(query),
    queryFn: () => getAdminGifts(query),
    placeholderData: keepPreviousData
  });
