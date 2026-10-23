'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useEffectEvent, useRef } from 'react';

import { ROUTES } from '@/shared/constants';
import { useRouter } from '@/shared/i18n/navigation';

import type { RedeemLoginState } from './use-redeem-login.types';

import { useTelegramSignIn } from '../use-telegram-sign-in';

export const useRedeemLogin = (): RedeemLoginState => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useTelegramSignIn();
  const redeemedRef = useRef<string | null>(null);

  const redeem = useEffectEvent((nextCode: string) => {
    signIn.mutate(nextCode, { onSuccess: () => router.replace(ROUTES.account) });
  });

  const code = searchParams.get('code');

  useEffect(() => {
    if (!code || redeemedRef.current === code) {
      return;
    }

    redeemedRef.current = code;

    redeem(code);
  }, [code]);

  return { hasFailed: !code || signIn.isError };
};
