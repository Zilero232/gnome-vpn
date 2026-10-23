'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToastError } from '@/entities/app/locale';
import { stopAdminCampaign } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useStopCampaign = () => {
  const queryClient = useQueryClient();
  const toastError = useToastError();

  return useMutation({
    mutationFn: stopAdminCampaign,
    onError: toastError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin() })
  });
};
