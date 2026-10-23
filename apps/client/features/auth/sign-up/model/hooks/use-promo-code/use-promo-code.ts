'use client';

import type { ChangeEvent } from 'react';

import { useDidUpdate, useMount } from '@siberiacancode/reactuse';
import { useState } from 'react';

import { readPendingPromoCode, syncPendingPromoCode } from '@/shared/lib';

import type { PromoState, UsePromoCodeInput } from './use-promo-code.types';

export const usePromoCode = ({ register, setValue, setFocus }: UsePromoCodeInput) => {
  const [state, setState] = useState<PromoState>('closed');

  useMount(() => {
    const pending = readPendingPromoCode();

    if (pending) {
      setValue('promoCode', pending);
      setState('prefilled');
    }
  });

  useDidUpdate(() => {
    if (state === 'opened') {
      setFocus('promoCode');
    }
  }, [state]);

  const registration = register('promoCode', { onChange: (event: ChangeEvent<HTMLInputElement>) => syncPendingPromoCode(event.target.value) });

  return { isOpen: state !== 'closed', registration, open: () => setState('opened') };
};
