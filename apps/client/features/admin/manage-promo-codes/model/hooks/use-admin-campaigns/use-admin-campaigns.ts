'use client';

import type { AdminCampaignQuery } from '@gnomevpn/schemas';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getAdminCampaigns } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminCampaigns = (query: AdminCampaignQuery) =>
  useQuery({
    queryKey: QUERY_KEYS.adminCampaigns(query),
    queryFn: () => getAdminCampaigns(query),
    placeholderData: keepPreviousData
  });
