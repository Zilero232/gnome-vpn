'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getAdminCampaigns } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminCampaigns = (page: number) =>
  useQuery({
    queryKey: QUERY_KEYS.adminCampaigns(page),
    queryFn: () => getAdminCampaigns(page),
    placeholderData: keepPreviousData
  });
