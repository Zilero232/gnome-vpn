'use client';

import { unsubscribeQuerySchema } from '@gnomevpn/schemas';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { match, P } from 'ts-pattern';

import { unsubscribe } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

import type { UnsubscribeState } from './use-unsubscribe.types';

export const useUnsubscribe = () => {
  const searchParams = useSearchParams();

  const query = unsubscribeQuerySchema.safeParse({ token: searchParams.get('token') ?? '' });
  const token = query.success ? query.data.token : '';

  const {
    data: result,
    isError,
    isRefetching,
    refetch
  } = useQuery({
    queryKey: QUERY_KEYS.unsubscribe(token),
    queryFn: () => unsubscribe({ token }),
    enabled: token !== '',
    retry: false,
    staleTime: Number.POSITIVE_INFINITY
  });

  const state = match({ token, result, isError })
    .returnType<UnsubscribeState>()
    .with({ token: '' }, () => 'invalid')
    .with({ result: P.nonNullable }, ({ result: { outcome } }) => outcome)
    .with({ isError: true }, () => 'failed')
    .otherwise(() => 'pending');

  return { state, isRetrying: isRefetching, retry: () => void refetch() };
};
