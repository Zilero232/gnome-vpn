'use client';

import type { AdminPaymentQuery } from '@gnomevpn/schemas';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getAdminPayments } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useAdminPayments = (query: AdminPaymentQuery) =>
  useQuery({
    queryKey: QUERY_KEYS.adminPayments(query),
    queryFn: () => getAdminPayments(query),
    placeholderData: keepPreviousData
  });
