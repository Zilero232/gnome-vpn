'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useToastError } from '@/entities/app/locale';
import { apiErrorCode, refundAdminPayment } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useRefundPayment = () => {
  const t = useTranslations('admin.payments.refund');
  const queryClient = useQueryClient();
  const toastError = useToastError();

  return useMutation({
    mutationFn: refundAdminPayment,
    onError: (error) => {
      if (apiErrorCode(error) === 'PAYMENT_FAILED') {
        toast.error(t('failed'));

        return;
      }

      toastError(error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin() })
  });
};
