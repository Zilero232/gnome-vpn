'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getAdminGifts } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminGifts = (page: number) =>
  useQuery({
    queryKey: QUERY_KEYS.adminGifts(page),
    queryFn: () => getAdminGifts(page),
    placeholderData: keepPreviousData
  });
