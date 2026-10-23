'use client';

import type { PlanId } from '@gnomevpn/schemas';

import { useMutation } from '@tanstack/react-query';

import { useLocale, useToastError } from '@/entities/app/locale';
import { buyGift } from '@/shared/api';
import { redirectToConfirmation } from '@/shared/lib';

export const useBuyGift = () => {
  const { locale } = useLocale();
  const toastError = useToastError();

  return useMutation({
    mutationFn: (planId: PlanId) => buyGift({ planId, locale }),
    onSuccess: ({ confirmationUrl }) => {
      redirectToConfirmation(confirmationUrl);
    },
    onError: toastError
  });
};
