'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useToastError } from '@/entities/app/locale';
import { apiErrorCode, createAdminCampaign } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useCreateCampaign = () => {
  const t = useTranslations('admin.promo.form');
  const queryClient = useQueryClient();
  const toastError = useToastError();

  return useMutation({
    mutationFn: createAdminCampaign,
    onError: (error) => {
      if (apiErrorCode(error) === 'VALIDATION_FAILED') {
        toast.error(t('refused'));

        return;
      }

      toastError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin() })
  });
};
