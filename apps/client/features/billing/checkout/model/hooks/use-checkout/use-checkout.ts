import type { PlanId } from '@gnomevpn/schemas';

import { useMutation } from '@tanstack/react-query';

import { useLocale, useToastError } from '@/entities/app/locale';
import { createCheckout } from '@/shared/api';

import { useSettlePayment } from '../use-settle-payment';

export const useCheckout = () => {
  const { locale } = useLocale();
  const settlePayment = useSettlePayment();
  const toastError = useToastError();

  return useMutation({
    mutationFn: (planId: PlanId) => createCheckout({ planId, locale }),
    onSuccess: settlePayment,
    onError: toastError
  });
};
