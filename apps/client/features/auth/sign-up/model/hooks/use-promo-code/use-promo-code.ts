'use client';

import type { ChangeEvent } from 'react';

import { useDidUpdate, useMount } from '@siberiacancode/reactuse';
import { useState } from 'react';

import { readPendingReferral, syncPendingReferral } from '@/shared/lib';

import type { PromoState, UsePromoCodeInput } from './use-promo-code.types';

export const usePromoCode = ({ register, setValue, setFocus }: UsePromoCodeInput) => {
  const [state, setState] = useState<PromoState>('closed');

  useMount(() => {
    const pending = readPendingReferral();

    if (pending) {
      setValue('referralCode', pending);
      setState('prefilled');
    }
  });

  useDidUpdate(() => {
    if (state === 'opened') {
      setFocus('referralCode');
    }
  }, [state]);

  const registration = register('referralCode', { onChange: (event: ChangeEvent<HTMLInputElement>) => syncPendingReferral(event.target.value) });

  return { isOpen: state !== 'closed', registration, open: () => setState('opened') };
};
