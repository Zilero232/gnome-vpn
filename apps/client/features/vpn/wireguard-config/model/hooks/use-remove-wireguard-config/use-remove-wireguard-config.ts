'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useToastError } from '@/entities/app/locale';
import { removeDevice } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useRemoveWireguardConfig = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('wireguard');
  const toastError = useToastError();

  return useMutation({
    mutationFn: (id: string) => removeDevice({ id }),
    onSuccess: () => toast.success(t('removed')),
    onError: toastError,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wireguard() }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.devices() })
      ])
  });
};
