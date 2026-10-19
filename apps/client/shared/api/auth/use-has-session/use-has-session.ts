'use client';

import { isNonNullish } from 'remeda';

import { useHydrated } from '@/shared/lib';

import { authClient, getAuthToken } from '../auth-client';

export const useHasSession = (): boolean => {
  const { data: session } = authClient.useSession();
  const isHydrated = useHydrated();

  return isNonNullish(session?.user) || (isHydrated && Boolean(getAuthToken()));
};
