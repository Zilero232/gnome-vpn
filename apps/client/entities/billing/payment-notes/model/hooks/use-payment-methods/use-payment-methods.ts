'use client';

import { useQuery } from '@tanstack/react-query';

import { getPaymentMethods } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

import { PAYMENT_METHODS_STALE_MS } from './use-payment-methods.constants';

export const usePaymentMethods = () =>
  useQuery({
    queryKey: QUERY_KEYS.paymentMethods(),
    queryFn: getPaymentMethods,
    staleTime: PAYMENT_METHODS_STALE_MS
  });
