'use client';

import { useLocalStorage } from '@siberiacancode/reactuse';
import { isNonNullish } from 'remeda';

import { STORAGE_KEYS } from '@/shared/constants';
import { useHydrated } from '@/shared/lib';

import { authClient } from '../auth-client';

export const useHasSession = (): boolean => {
  const { data: session } = authClient.useSession();
  const { value: token } = useLocalStorage<string>(STORAGE_KEYS.authToken);
  const isHydrated = useHydrated();

  return isNonNullish(session?.user) || (isHydrated && Boolean(token));
};
