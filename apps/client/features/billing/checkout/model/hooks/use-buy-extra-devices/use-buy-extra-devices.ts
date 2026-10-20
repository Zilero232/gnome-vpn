import { useMutation } from '@tanstack/react-query';

import { useLocale, useToastError } from '@/entities/app/locale';
import { buyExtraDevices } from '@/shared/api';

import { useSettlePayment } from '../use-settle-payment';

export const useBuyExtraDevices = () => {
  const { locale } = useLocale();
  const settlePayment = useSettlePayment();
  const toastError = useToastError();

  return useMutation({
    mutationFn: (quantity: number) => buyExtraDevices({ quantity, locale }),
    onSuccess: settlePayment,
    onError: toastError
  });
};
